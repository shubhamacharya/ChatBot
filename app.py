from urllib import response
from flask import Flask, redirect,render_template,request,jsonify, url_for
from flask_cors import CORS
from chat import get_response
from json_util import *

app = Flask(__name__)
CORS(app)

@app.route("/",methods=['GET','POST'])
def index_get():
    return render_template("index.html")

@app.route("/predict",methods=['POST'])
def predict():
    text = request.get_json().get("message")
    # TODO : check text validity
    response = get_response(text)
    message = {"answer":response}
    return jsonify(message)

@app.route("/admin",methods=['GET'])
def admin_get():
    tags = getTagList()
    return render_template("admin.html",tags=tags)

@app.route("/addQuestion",methods=['POST'])
def addQuestion_post():
    questions = request.form["questions"].split('\n')
    answer = request.form["answer"]
    tag = request.form["tags"]
    
    '''pattern = ["This is my question."]
    responses = ["This is answer"]
    tag = "test"
    '''
    
    #addQuestion(pattern,responses,tag)
    #print(questions+"\t"+answer+"\t"+tag)
    return redirect(url_for('admin_get'))


if __name__ == "__main__":
    app.run(debug=True)