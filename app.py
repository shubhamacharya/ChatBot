from urllib import response
from flask import Flask, redirect,render_template,request,jsonify, url_for
from flask_cors import CORS
from chat import get_response
import re
from json_util import *

app = Flask(__name__)
CORS(app)

unanswered_question = []

@app.route("/",methods=['GET','POST'])
def index_get():
    return render_template("index.html")

@app.route("/predict",methods=['POST'])
def predict():
    text = request.get_json().get("message")
    # TODO : check text validity
    global unanswered_question
    
    response,text = get_response(text)
    unanswered_question.append(text)
    #unansweredWriteJSON(unanswered_question)
    message = {"answer":response}
    return jsonify(message)

@app.route("/admin",methods=['GET'])
def admin_get():
    tags = getTagList()
    unanswered_question = getUnanswered()
    return render_template("admin.html",tags=tags,unanswered=unanswered_question)

@app.route("/addQuestion",methods=['POST'])
def addQuestion_post():
    unformattedPatterns = request.form["questions"].split('\n')
    pattern = list(map(lambda x : re.sub("\r","",x),unformattedPatterns))

    unformattedResponses = request.form["answer"].split('\n')
    responses = list(map(lambda x : re.sub("\r","",x),unformattedResponses))

    tag = request.form["newTag"]

    addQuestion(pattern,responses,tag)
    return redirect(url_for('admin_get'))

@app.route("/unanswered",methods=['POST'])
def unanswered_post():
    unformattedPatterns = request.form[""]

if __name__ == "__main__":
    app.run(debug=True)