from models.db_connection import get_db_connection

class ClientModel:
    @staticmethod
    def get_all():
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM clients ORDER BY id DESC")
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def get_by_id(client_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM clients WHERE id = %s", (client_id,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def create(name, email, phone, address):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO clients (name, email, phone, address) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (name, email, phone, address))
            connection.commit()
            return cursor.lastrowid
        finally:
            connection.close()

    @staticmethod
    def update(client_id, name, email, phone, address):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "UPDATE clients SET name = %s, email = %s, phone = %s, address = %s WHERE id = %s"
                cursor.execute(sql, (name, email, phone, address, client_id))
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()

    @staticmethod
    def delete(client_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM clients WHERE id = %s", (client_id,))
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()
