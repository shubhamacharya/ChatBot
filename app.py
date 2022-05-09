from flask import Flask,session,redirect,render_template,request,jsonify,url_for,flash,make_response
from flask_cors import CORS
from datetime import datetime
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
    user = session['user']
    if request.method == 'GET':
        if user and user["role"] == "superAdmin":  
            return render_template("register.html")
        else:
            return redirect(url_for("login"))
    else:
        if user and user["role"] == "superAdmin":
            email = request.form['email']
            password = request.form['password']
            role = request.form['role']
            check_auth(email,password,role,add=True)
            session['user'] = user
            return redirect(url_for("admin_get"))

@app.route("/login",methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template("login.html")
    else:
        email = request.form['email']
        password = request.form['password']
        check = check_auth()
        if check:   
            auth_file = open("./auth.json","r+")
            data = json.load(auth_file)
            user = {}
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
        try:
            createRequiredFiles('./logs.json')
            user = session['user']
            tags = getTagList()
            unanswered_question = getUnanswered(user)
            count = len(unanswered_question)
            print(unanswered_question)
        except Exception as e:
            print(e)
        return render_template("admin.html",user=user,tags=tags,unanswered=unanswered_question,count=count)
    else:
        return redirect(url_for('login'))

@app.route("/addQuestion",methods=['POST'])
def addQuestion_post():
    user = session['user']
    FILE = "./logs.json"

    unformattedPatterns = request.form["questions"]
    pattern = formatList(unformattedPatterns)

    unformattedResponses = request.form["answer"]
    responses = formatList(unformattedResponses)
    tag = request.form["newTag"]
    
    if addQuestion(pattern,responses,tag):
        try:
            file = open(FILE,"r+")
            data = json.load(file)
            
            data["added"].append({
                "questions" : pattern,
                "response" : responses,
                "tag" : tag,
                "adminId" : user['email'],
                "timeStamp" : datetime.now().strftime("%d-%b-%Y (%H:%M:%S.%f)")
            })

            file = open(FILE,"w+")
            file.seek(0)
            json.dump(data,file,indent=4)
            
            flash("Question added Successfully...")
            print("Question added Successfully...")     
        except Exception as e:
            print(e)
        finally:
            file.close()
            session['user'] = user
            return redirect(url_for('admin_get'))

@app.route("/unanswered",methods=['POST'])
def unanswered_post():
    user = session['user']
    question = request.form["question"]
    unformattedResponse = request.form["addAnswer"]
    tag = ""
    if(request.form["addAnsTags"] != "nota"):
        tag = request.form["addAnsTags"]
    else:
        tag = request.form["addNewAnsTags"]
    
    FILE = "./logs.json"
    
    try:
        file = open(FILE,"r+")
        data = json.load(file)

        if user['role'] == 'superAdmin':
            if addQuestion(question,unformattedResponse,tag,switch=True):
                for i in data['unanswered']:
                    if question in list(i.keys())[0]:
                        i['superAdminApproval'] = 1
                        i['superAdminId'] = user['email'] 
                        i['superAdminTimeStamp'] = datetime.now().strftime("%d-%b-%Y (%H:%M:%S.%f)")    
            else:
                flash("Question not added.")
        else: #For Normal Admins
            for i in data['unanswered']:
                if question in list(i.keys())[0]:
                    i["response"] = unformattedResponse
                    i["tag"] = tag
                    i["adminId"] = user['email']
                    i[question] = 1
                    i["adminTimeStamp"] = datetime.now().strftime("%d-%b-%Y (%H:%M:%S.%f)")
        
        file = open(FILE,"w+")
        file.seek(0)
        json.dump(data,file,indent=4)
            
        flash("Question added Successfully...")
        print("Question added Successfully...")
        
    except Exception as e:
        print(f"Error while writing to {FILE}.",e)
    finally:
        file.close()
        session['user'] = user
        return redirect(url_for('admin_get'))

@app.route("/api/tag",methods=['GET'])
def fetchTag():
    args = request.args.to_dict()
    opt =  getTagQuestion(args.get("tag"))
    return opt

@app.route("/api/updateQuestion",methods=['POST'])
def updateQuestion():
    req = request.get_json()
    
    unformattedQuestion = list(req["pattern"])
    unformattedAnswers = list(req["responses"])
    tag = req["tag"]

    patterns  = formatList(unformattedQuestion)
    response = formatList(unformattedResponse)
    
    #Call to add updated question
    res = make_response(jsonify({"message":"Updated Question Successfully"}),200)
    return res

if __name__ == "__main__":
    app.run(debug=True)