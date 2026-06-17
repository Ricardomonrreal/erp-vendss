from models.db_connection import get_db_connection
from models.product_model import ProductModel
import pymysql

class SaleModel:
    @staticmethod
    def get_all():
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    SELECT s.id, s.sale_date, s.total, c.name as client_name 
                    FROM sales s
                    LEFT JOIN clients c ON s.client_id = c.id
                    ORDER BY s.id DESC
                """
                cursor.execute(sql)
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def get_by_id(sale_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    SELECT s.id, s.sale_date, s.total, s.client_id, c.name as client_name, c.email as client_email
                    FROM sales s
                    LEFT JOIN clients c ON s.client_id = c.id
                    WHERE s.id = %s
                """
                cursor.execute(sql, (sale_id,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def get_items(sale_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    SELECT si.id, si.product_id, p.name as product_name, p.sku as product_sku, 
                           si.quantity, si.unit_price, (si.quantity * si.unit_price) as subtotal
                    FROM sale_items si
                    LEFT JOIN products p ON si.product_id = p.id
                    WHERE si.sale_id = %s
                """
                cursor.execute(sql, (sale_id,))
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def create(client_id, items):
        """
        Registra una venta dentro de una transacción.
        Deduce automáticamente el inventario (stock) de cada producto.
        items: lista de diccionarios [{'product_id': int, 'quantity': int}]
        """
        if not items:
            raise ValueError("La venta debe contener al menos un producto.")

        connection = get_db_connection()
        try:
            connection.begin()
            with connection.cursor() as cursor:
                # 1. Insertar la cabecera de la venta con total inicial 0
                sql_sale = "INSERT INTO sales (client_id, total) VALUES (%s, 0.00)"
                cursor.execute(sql_sale, (client_id,))
                sale_id = cursor.lastrowid

                total_sale = 0.00

                # 2. Procesar cada producto
                for item in items:
                    prod_id = item['product_id']
                    qty = int(item['quantity'])

                    if qty <= 0:
                        raise ValueError("La cantidad debe ser mayor a 0.")

                    # Obtener el producto bloqueándolo para lectura de stock (SELECT ... FOR UPDATE)
                    cursor.execute("SELECT sku, name, price, stock FROM products WHERE id = %s FOR UPDATE", (prod_id,))
                    product = cursor.fetchone()

                    if not product:
                        raise ValueError(f"El producto con ID {prod_id} no existe.")

                    if product['stock'] < qty:
                        raise ValueError(f"Stock insuficiente para el producto '{product['name']}' (SKU: {product['sku']}). Stock disponible: {product['stock']}.")

                    unit_price = product['price']
                    subtotal = unit_price * qty
                    total_sale += subtotal

                    # Descontar stock
                    ProductModel.update_stock(cursor, prod_id, -qty)

                    # Insertar detalle del ítem de venta
                    sql_item = """
                        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) 
                        VALUES (%s, %s, %s, %s)
                    """
                    cursor.execute(sql_item, (sale_id, prod_id, qty, unit_price))

                # 3. Actualizar el total de la venta
                sql_update_total = "UPDATE sales SET total = %s WHERE id = %s"
                cursor.execute(sql_update_total, (total_sale, sale_id))

            connection.commit()
            return sale_id
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()
