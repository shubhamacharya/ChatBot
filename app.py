from flask import Flask,render_template,request,jsonify
from flask_cors import CORS
from chat import get_response

app = Flask(__name__)
CORS(app)

@app.get("/")
def index_get():
    return render_template("index.html")

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    # TODO : check text validity
    response = get_response(text)
    message = {"answer":response}
    return jsonify(message)

@app.get("/admin")
def admin_get():
    return render_template("admin.html")

if __name__ == "__main__":
    app.run(debug=True)