import os
from flask import Flask, render_template, jsonify, send_from_directory
from jinja2 import ChoiceLoader, FileSystemLoader

app = Flask(__name__)

# Configurar el cargador de templates de Jinja para buscar en 'templates' y en la raíz '.'
app.jinja_loader = ChoiceLoader([
    FileSystemLoader('templates'),
    FileSystemLoader('.')
])

@app.route('/components/<path:path>')
def send_components(path):
    return send_from_directory('components', path)

# --- VISTAS TEMPLATE ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/products', methods=['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def api_products(*args, **kwargs):
    return jsonify([])

@app.route('/api/clients', methods=['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/api/clients/<int:client_id>', methods=['GET', 'PUT', 'DELETE'])
def api_clients(*args, **kwargs):
    return jsonify([])

@app.route('/api/sales', methods=['GET', 'POST'])
@app.route('/api/sales/<int:sale_id>', methods=['GET'])
@app.route('/api/sales/<int:sale_id>/items', methods=['GET'])
def api_sales(*args, **kwargs):
    return jsonify([])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
