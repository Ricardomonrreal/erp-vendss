from models.db_connection import get_db_connection

class ProductModel:
    @staticmethod
    def get_all():
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM products ORDER BY id DESC")
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def get_by_id(product_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def get_by_sku(sku):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM products WHERE sku = %s", (sku,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def create(sku, name, description, price, stock):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO products (sku, name, description, price, stock) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(sql, (sku, name, description, price, stock))
            connection.commit()
            return cursor.lastrowid
        finally:
            connection.close()

    @staticmethod
    def update(product_id, sku, name, description, price, stock):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "UPDATE products SET sku = %s, name = %s, description = %s, price = %s, stock = %s WHERE id = %s"
                cursor.execute(sql, (sku, name, description, price, stock, product_id))
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()

    @staticmethod
    def delete(product_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()

    @staticmethod
    def update_stock(cursor, product_id, quantity_change):
        """
        Actualiza el stock de un producto dentro de una transacción.
        El cursor debe ser provisto por la transacción activa.
        """
        sql = "UPDATE products SET stock = stock + %s WHERE id = %s"
        cursor.execute(sql, (quantity_change, product_id))
