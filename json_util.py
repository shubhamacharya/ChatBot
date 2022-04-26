import json
import re
from os import path,stat
from werkzeug.security import generate_password_hash


def formatList(unformattedList):
    tempList = unformattedList.split('\n')
    return list(map(lambda x : re.sub("\r","",x),tempList))

def addQuestion(pattern,response,tag,switch=False):
    file = open("./test.json","r+")
    data = json.load(file)

    questionFlag = False
    tagFlag = False

    tags = getTagList()
    index = -1
    try:
        index = tags.index(tag)
    except ValueError:
        tagFlag = False

    if index != -1:
        tagFlag == True 
    

    if switch:
        for i in range(len(data['intents'])):
            if pattern in data['intents'][i]['patterns']:
                questionFlag = True
                
        pattern = formatList(pattern)
        response = formatList(response)
    print(data['intents'][index])

    if tagFlag: # Append to the tag if tag is present 
        if questionFlag:
            pass
        else:
            data['intents'][index]['patterns'].extend(pattern)
            data['intents'][index]['responses'].extend(response)    
    else: #If tag not present in json file create new object
        entry = {"tag":tag,"patterns":pattern,"responses":response}
        data['intents'].append(entry)
         
    try:
        file.seek(0)
        json.dump(data,file,indent=4)
        op=True
    except:
         op=False
    finally:
        file.close()
        return op

def getTagList():
    file = open("./test.json","r")
    data = json.load(file)
    tags = []
    for intent in data['intents']:
        tags.append(intent['tag'])
    file.close()
    return tags

def getTagQuestion(tag):
    try:
        file = open("./test.json","r")
        data = json.load(file)
        question = {}
        for intent in data['intents']:
            if intent['tag'] == tag:
                question = dict(intent)
    except:
        print("Error")
    finally:
        file.close()
        return question

def getUnanswered():
    unansweredList = []
    if path.exists("./unanswered.json"):
        try:
            file = open("./unanswered.json","r+")
            data = json.load(file)
            for ques in data['question']:
                unansweredList.extend(ques.keys())
        except:
            pass
        finally:
            file.close()
            return unansweredList

def unansweredWriteJSON(unanswered):
    '''
    1.Add all unanswered question to the file with any flag.
        Flag will set when the question is answered by admin.
    2. Call addQuestion method to add or append the questions.
    3. Remove all the questions from file whoes flag is set.
    '''
    if not path.exists('./unanswered.json') or stat('./unanswered.json').st_size==0:
        print("Creating File 'unanswered.json'")
        file = open("./unanswered.json","w+")
        json.dump({"question":[]},file)
        file.close()
    else:
        unanswer = {unanswered[i]:0 for i in range(len(unanswered))}
        file = open("./unanswered.json","r+")
        data = json.load(file)
        data['question'].append(unanswer)
        print("Writing to the file 'unanswered.json'")
        file.seek(0)
        json.dump(data,file,indent=4)
        file.close()

def check_auth(email="",password="",add=False):
    '''
    Creates the default admin user if file does not exists.
    '''
    if not add:
        if not path.exists('./auth.json') or stat('./auth.json').st_size==0:
            try:
                file = open("./auth.json","w+")
                password = generate_password_hash('admin123','sha256')
                json.dump({"auth":[{'email':'admin@gmail.com','password':password,'status':"active"}]},file)
            except:
                print("Error")
            finally:
                print("Check Auth Successfull")
                file.close()
        else:
            return True
    else:
        file = open("./auth.json","r+")
        data = json.load(file)
        password = generate_password_hash(password,'sha256')
        data['auth'].append({'email':email,'password':password,'status':"active"})

'''question = "this is question 1"
ans = "this is ans 1"
tag = "test"
addQuestion(question,ans,tag,switch=True)
'''
