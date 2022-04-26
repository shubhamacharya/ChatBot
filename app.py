from flask import Flask,session,redirect,render_template,request,jsonify, url_for,flash
from flask_cors import CORS
from chat import get_response
from werkzeug.security import generate_password_hash,check_password_hash
from json_util import *
import os

app = Flask(__name__)
app.secret_key = os.urandom(16).hex()
CORS(app)

unanswered_question = []

@app.route("/",methods=['GET','POST'])
def index_get():
    return render_template("index.html")

@app.route("/register",methods=['GET','POST'])
def register():
    if request.method == 'GET':
        if 'user' in session:  
            return render_template("register.html")
        else:
            return redirect(url_for("login"))
    else:
        if 'user' in session:
            email = request.form['email']
            password = request.form['password']

            check_auth(email,password,add=True)
            return redirect(url_for("admin"))

@app.route("/login",methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template("login.html")
    else:
        email = request.form['email']
        password = request.form['password']
        check = check_auth()
        print(check)
        if check:   
            auth_file = open("./auth.json","r+")
            data = json.load(auth_file)
            
            for rec in data['auth']:
                if rec['email'] == email:
                   user = rec
            
            if rec['status'] == 'active':
                if not user or not check_password_hash(user['password'],password):
                    flash("Invalid Username or Password.")
                    print("Invalid Username or Password.")
                    redirect(url_for('login'))
                else:
                    session['user'] = user
                    print("Login Success")
                    return redirect(url_for('admin_get'))
            else:
                flash("User is not active.")
    return redirect(url_for('login'))

@app.route("/logout",methods=['GET','POST'])
def logout():
    session['user'] = None
    return redirect(url_for('login'))

@app.route("/predict",methods=['POST'])
def predict():
    text = request.get_json().get("message")
    # TODO : check text validity
    global unanswered_question
    
    response,text = get_response(text)
    unanswered_question.append(text)
    unansweredWriteJSON(unanswered_question)
    message = {"answer":response}
    return jsonify(message)

@app.route("/admin",methods=['GET'])
def admin_get():
    if 'user' in session:
        user = session['user']
        tags = getTagList()
        unanswered_question = getUnanswered()
        count = len(unanswered_question)
        return render_template("admin.html",tags=tags,unanswered=unanswered_question,count=count)
    else:
        return redirect(url_for('login'))

@app.route("/addQuestion",methods=['POST'])
def addQuestion_post():
    unformattedPatterns = request.form["questions"]
    pattern = formatList(unformattedPatterns)

    unformattedResponses = request.form["answer"]
    responses = formatList(unformattedResponses)

    tag = request.form["newTag"]

    addQuestion(pattern,responses,tag)
    return redirect(url_for('admin_get'))

@app.route("/unanswered",methods=['POST'])
def unanswered_post():
    user = session['user']
    question = request.form["question"]
    unformattedResponse = request.form["addAnswer"]
    tags = request.form["addAnstags"]

    if addQuestion(question,unformattedResponse,tags,switch=True):
        try:
            file = open("./unanswered.json","r+")
            data = json.load(file)

            for i in range(len(data['question'])):
                if question in data['question'][i]:
                    data['question'][i].pop(question) 
            
            file = open("./unanswered.json","w+")
            file.seek(0)
            json.dump(data,file)
            
            flash("Question added Successfully...")
            session['user'] = user
        except:
            pass
        finally:
            file.close()
    else:
        flash("Question not added.")

    return redirect(url_for('admin_get'))

@app.route("/api/tag",methods=['GET'])
def fetchTag():
    args = request.args
    args = args.to_dict()
    return getTagQuestion(args.get("tag"))
     
     
if __name__ == "__main__":
    app.run(debug=True)