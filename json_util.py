import json
import re
from os import path,stat
from werkzeug.security import generate_password_hash


def formatList(unformattedList):
    tempList = unformattedList.split('\n')
    return list(map(lambda x : re.sub("\r","",x),tempList))

def addQuestion(pattern,response,tag,switch=False):
    questionFlag = False
    tagFlag = False
    index = -1
    try:
        file = open("./test.json","r+")
        data = json.load(file)
        tags = getTagList()
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
    try:
        file = open("./test.json","r")
        data = json.load(file)
        tags = []
        for intent in data['intents']:
            tags.append(intent['tag'])
    except Exception as e:
        print("Error while fetching tag list.",e)
    finally:
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
    except Exception as e:
        print("Error while fetching question tag",e)
    finally:
        file.close()
        return question

def getUnanswered(user):
    unansweredList = []
    adminInfo = []
    if path.exists("./unanswered.json"):
        try:
            file = open("./unanswered.json","r+")
            data = json.load(file)
            if user == 'superAdmin':
                for ques in data['question']:
                    if ques[list(ques)[0]] == 1 and ques['adminId'] != "":
                        unansweredList.append(list(ques)[0])
                        adminInfo.append(ques['adminId'])
            else:
                for ques in data['question']:
                    if ques[list(ques)[0]] == 0 and ques['superAdminApproval'] == 0:
                        unansweredList.append(list(ques)[0])
                        
            #print(unansweredList)
            #print(adminInfo)
        except Exception as e:
            print("Error While fetching the Unanswered Questions List.",e)
        finally:
            file.close()
            return (unansweredList,adminInfo)

def unansweredWriteJSON(unanswered):
    '''
    1.Add all unanswered question to the file with any flag.
        Flag will set when the question is answered by admin.
    2. Call addQuestion method to add or append the questions.
    3. Remove all the questions from file whoes flag is set.
    '''
    FILE = './unanswered.json'
    if not path.exists(FILE) or stat(FILE).st_size==0:
        print(f"Creating File {FILE}.")
        try:
            file = open(FILE,"w+")
            json.dump({"question":[]},file)
        except Exception as e:
            print(f"Error while creating {FILE}.",e)
        finally:
            file.close()
    
    try:
        file = open(FILE,"r+")
        data = json.load(file)
        for i in range(len(unanswered)):
            data['question'].append({    
                unanswered[i]:0,
                "response":"",
                "adminId" : "",
                "superAdminApproval" : 0,
                "superAdminId" :""
            })
        print("Writing to the file 'unanswered.json'")
        
        file.seek(0)
        json.dump(data,file,indent=4)
    
    except Exception as e:
        print(f"Error while writing to the {FILE}.",e)
    finally:
        file.close()

def check_auth(email="",password="",role="",add=False):
    '''
    Creates the default admin user if file does not exists.
    '''
    AUTH_FILE = './auth.json'
    if not add:
        if not path.exists(AUTH_FILE) or stat(AUTH_FILE).st_size==0:
            try:
                file = open(AUTH_FILE,"w+")
                password = generate_password_hash('admin123','sha256')
                json.dump({"auth":[{'email':'admin@gmail.com','password':password,'status':"active",'role':'superAdmin'}]},file)
            except:
                print("Error")
            finally:
                print("Check Auth Successfull")
                file.close()
        else:
            return True
    else:
        try:
            file = open(AUTH_FILE,"r+")
            data = json.load(file)
            password = generate_password_hash(password,'sha256')
            data['auth'].append({'email':email,'password':password,'status':"active",'role':role})
            file.seek(0)
            file.write(json.dumps(data))
        except Exception as e:
            print("Error while adding new admin.",e)
        finally:
            file.close()

#questions = ["this is question 1","this is question 2","this is question 3","this is question 4"]
#getUnanswered('Admin')
#unansweredWriteJSON(questions)
