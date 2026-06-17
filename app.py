from flask import Flask, render_template, jsonify

app = Flask(__name__)

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
