// Collapsible
var coll = document.getElementsByClassName("collapsible");

for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");

        var content = this.nextElementSibling;

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }

    });
}

function getTime() {
    let today = new Date();
    hours = today.getHours();
    minutes = today.getMinutes();

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let time = hours + ":" + minutes;
    return time;
}

// Gets the first message
function firstBotMessage() {
    let firstMessage = "Hi this is ChatterBot"
    document.getElementById("botStarterMessage").innerHTML = '<p class="botText"><span>' + firstMessage + '</span></p>';

    let time = getTime();

    $("#chat-timestamp").append(time);
    document.getElementById("userInput").scrollIntoView(false);
}

firstBotMessage();

let param = { "userEmail": "", "userQuestions": "" }
unanswered_count = 0
questionFlag = false
    // Retrieves the response
const getHardResponse = async(userText) => {
    let botResponse = ""

    let mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    botResponse = await getBotResponse(userText)
    if (unanswered_count == 2) {
        if (param["userQuestions"] != "" && param["userEmail"] == "") {
            if (userText.match(mailformat)) {
                param["userEmail"] = userText
                questionFlag = null
                let res = ""
                if (param["userEmail"] != "" && param["userQuestions"] != "") {
                    console.log("Sending POST Request.")
                    console.log("User Question : " + param["userQuestions"] + " User Mail : " + param["userEmail"])
                    res = await fetch('/api/fetchUserMail', {
                        method: 'POST',
                        body: JSON.stringify(param),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                }
                if (res.status == 200) {
                    r = await res.json()
                    botResponse = r.message
                    unanswered_count = 0
                    param["userQuestions"] = ""
                    param["userEmail"] = ""
                    botResponse = "Thanks We will reach you soon."
                }
            }
        }

        if (questionFlag == true) {
            param["userQuestions"] = userText
            botResponse = "Please provide your email"
        }

        if (questionFlag == false) {
            botResponse = "Please write your question."
            questionFlag = true
        }
    }

    if (botResponse == "I am unable to understand....") {
        unanswered_count += 1
    }
    //console.log("Unanswered Ques "+unanswered_question+"\n"+" Question Flag "+questionFlag+"\n"+"Unanswered Cnt "+unanswered_question)
    let botHtml = '<p class="botText"><span>' + botResponse + '</span></p>';
    $("#chatbox").append(botHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);
}

//Gets the text text from the input box and processes it
function getResponse() {
    let userText = $("#textInput").val();

    if (userText == "") {
        userText = " ";
    }

    let userHtml = '<p class="userText"><span>' + userText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);

    setTimeout(() => {
        getHardResponse(userText);
    }, 1000)

}

// Handles sending text via button clicks
function buttonSendText(sampleText) {
    let userHtml = '<p class="userText"><span>' + sampleText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);

    //Uncomment this if you want the bot to respond to this buttonSendText event
    // setTimeout(() => {
    //     getHardResponse(sampleText);
    // }, 1000)
}

function sendButton() {
    getResponse();
}

function heartButton() {
    buttonSendText("Heart clicked!")
}

// Press enter to send a message
$("#textInput").keypress(function(e) {
    if (e.which == 13) {
        getResponse();
    }
});

const getBotResponse = async(input) => {
    try {
        let res = await fetch("http://127.0.0.1:5000/" + '/predict', {
            method: 'POST',
            body: JSON.stringify({ message: input }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        let r = await res.json();
        return r.answer
    } catch (error) {
        console.error('Error:', error);
    }
}

async function changePasswd() {
    //Takes Current Password from user and validates with database.
    //Sets isConfirmed on successfull validation.
    const validationRes = await Swal.fire({
        title: 'Validate Password',
        input: 'password',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Validate',
        showLoaderOnConfirm: true,
        preConfirm: (password) => {
            return fetch('/api/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(password)
                }).then(response => {
                    if (response.status != 200) {
                        throw new Error(response.message)
                    }
                    return response.json()
                })
                .catch(error => {
                    Swal.showValidationMessage(
                        `Please Enter the Correct Password: ${error}`
                    )
                })
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
    if (validationRes.isConfirmed) {
        //If validation is successfull, asks user for new password
        var passwords
        await Swal.fire({
            title: 'Change Password',
            html: '<input type="password" id="swal-input1" class="swal2-input" placeholder="New Password">' +
                '<input type="password" id="swal-input2" class="swal2-input" placeholder="Retype Password">',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Change Password',
            showLoaderOnConfirm: true,
            preConfirm: function() {
                return new Promise(function(resolve) {
                    resolve([
                        $('#swal-input1').val(),
                        $('#swal-input2').val()
                    ])
                }).then(response => {
                    if (response[0] != response[1]) {
                        throw new Error("Password Not Matching.")
                    }
                    passwords = response

                }).catch(error => {
                    Swal.showValidationMessage(`Password Not Matching.`)
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
        })

        let change = await fetch('/api/updatePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwords[0])
        }).then(final_response => {
            if (final_response.status != 200) {
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Error While Changing Password',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
            return final_response.json()
        }).catch(error => {
            console.log(error.message)
        })

        if (change.message) {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: change.message,
                showConfirmButton: false,
                timer: 1500
            })
        }

    }
    location.reload();
}

var question = ""
var combineResponse
var editTag = ""
var editData = ""

async function getDataList()  {
    var select = document.getElementById('v-pills-edit').querySelector('#searchTag');
    let editTag = select.value
    
    let url = "/api/tag?tag=" + editTag

    let totalResponse = await fetch(url)
    editData = await totalResponse.json();

    document.querySelectorAll('#datalistOptions option').forEach(option => option.remove())

    let dataList = document.getElementById('datalistOptions')
    editData.patterns.forEach((item) => {
        var option = document.createElement('option')
        option.value = item
        dataList.appendChild(option)
    })
}

async function getEdit() {
    question = document.getElementById('datalistOptionsInput').value
    let newQuestion = document.getElementById('v-pills-edit').querySelectorAll('input.newQuestion')
    for (let i = 0; i < newQuestion.length; i++) {
        newQuestion[i].value = question;
    }
    var array = new Array();
  
    for(let res in editData.responses)
    {
        array.push(editData.responses[res])
    }
    combineResponse = array.join('\n')

    let combResp = document.getElementById('v-pills-edit').querySelectorAll('textarea.newResponse')
    
    var input = document.createElement("input");

    input.setAttribute("type", "hidden");

    input.setAttribute("name", "oldResponse");

    input.setAttribute("id","oldResponse")

    for(let i=0;i< combResp.length;i++)
    {
        combResp[i].value = combineResponse

    }
        combResp.innerHTML = combineResponse
        input.setAttribute("value", combineResponse);
        document.getElementsByClassName('editCardBody')[0].appendChild(input)
       console.log(document.getElementById('v-pills-edit').querySelectorAll('oldResponse'))
}

async function updateQuestion() {
    let updatedQuestion = ""
    let updatedResponses = ""
    let question = ""
    let response = ""
    let tag = "" 

    let temp = document.getElementById('v-pills-edit').getElementsByClassName('searchTag').value
    if(temp)
    {
        tag = temp
    }
    else
    {
        tag = document.getElementById('searchTag').value
    }

    let operationBtn = document.getElementsByName('btnradio')
    let opBtn = ""

    let adminId = document.getElementsByName("adminId").value
    for(var i=0,length = operationBtn.length;i<length;i++)
    {
        if(operationBtn[i].checked)
        {
            opBtn = operationBtn[i].value
        }
    }

    if(adminId != "")
    {
        updatedQuestion = document.getElementById("newQuestion").value
        question = document.getElementById('datalistOptionsInput').value

        updatedResponses = document.getElementById("newResponse").value
        combineResponse = document.getElementById("oldResponse").value
    }
    else
    {
        if (questionChange) {
            question = document.getElementById("oldQuestion").value
            updatedQuestion = document.getElementById("newQuestion").value
        }

        if (responseChange) {
            updatedResponses = document.getElementById("newResponse").value
        }
    }

    updatedJSON = { "oldQuestion": question, "pattern": updatedQuestion, "oldResponse": combineResponse, "responses": updatedResponses, "tag": tag, "btnradio":opBtn}

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedJSON)
    }
    
    let res = await fetch("/api/updateQuestion", options)
    if (res.status != 200) {
        Swal.fire({
            position: 'top-right',
            icon: 'error',
            title: response.status,
            showConfirmButton: false,
            timer: 1500
        })
    }
    else
    {
        let resJSON = await res.json()
        console.log(resJSON)
        if(resJSON.operation == "Approved")
        {
            Swal.fire({
                position: 'top-right',
                icon: 'success',
                title: "Question Updated Successfully...",
                showConfirmButton: false,
                timer: 1500
            })
        }
        else if(resJSON.operation == "Declined")
        {
            Swal.fire({
                position: 'top-right',
                icon: 'warning',
                title: "Question Declined.",
                showConfirmButton: false,
                timer: 1500
            })
        }
        else
        {
            Swal.fire({
                position: 'top-right',
                icon: 'success',
                title: "Question Added for Approval.",
                showConfirmButton: false,
                timer: 1500
            })
        }
    }
    location.reload();
}

async function addQuestions() {
    let question = document.getElementById("addQuestions").value
    let answer = document.getElementById("addQuestionAnswer").value
    let tag = document.getElementById("tags").value

    if(tag == "nota")
    {
        tag = document.getElementById("newTag").value
    }
    
    let operationBtn = document.getElementsByName('addBtnradio')
    console.log(operationBtn)
    let opBtn = ""
    
    if(operationBtn)
    {
        for(var i=0,length = operationBtn.length;i<length;i++)
        {
            if(operationBtn[i].checked)
            {
                opBtn = operationBtn[i].value
            }
        }
    }
    
    let addQuestion = {"questions":question,"answer":answer,"tag":tag,"btnradio":opBtn}
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(addQuestion)
    }
   
    let response = await fetch("/addQuestion", options)
    if (response.status != 200) {
        Swal.fire({
            position: 'top-right',
            icon: 'error',
            title: response.status,
            showConfirmButton: false,
            timer: 1500
        })
    }
    else
    {
        let resJSON = await response.json()
        if(resJSON.operation == "Approved")
        {
            Swal.fire({
                position: 'top-right',
                icon: 'success',
                title: "Question Added Successfully...",
                showConfirmButton: false,
                timer: 1500
            })
        }
        else if(resJSON.operation == "Declined")
        {
            Swal.fire({
                position: 'top-right',
                icon: 'warning',
                title: "Question Declined.",
                showConfirmButton: false,
                timer: 1500
            })
        }
        else
        {
            Swal.fire({
                position: 'top-right',
                icon: 'success',
                title: "Question Added for Approval.",
                showConfirmButton: false,
                timer: 1500
            })
        }
    }
    location.reload();
}

async function answerQuestion() {
    let question = document.getElementById("ansQuestion").value
    let answer = document.getElementById("ansAnswer").value
    let tag = document.getElementById("ansAnsTags").value

    if(tag == "nota")
    {
        tag = document.getElementById("ansAnsNewTag").value
    }

    let operationBtn = document.getElementsByName('ansBtnradio')
    let opBtn = ""
    for(var i=0,length = operationBtn.length;i<length;i++)
    {
        if(operationBtn[i].checked)
        {
            opBtn = operationBtn[i].value
        }
    }
    console.log(opBtn)

    let answeredQuestion = {"questions":question,"answer":answer,"tag":tag,"btnradio":opBtn}
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(answeredQuestion)
    }
   
    let response = await fetch("/unanswered", options)
    if (response.status != 200) {
        Swal.fire({
            position: 'top-right',
            icon: 'error',
            title: response.status,
            showConfirmButton: false,
            timer: 1500
        })
    }
    else
    {
        let resJSON = await response.json()
        console.log(resJSON)
        if(resJSON.operation == "Approved")
        {
            Swal.fire({
                position: 'top-right',
                icon: 'success',
                title: "Question Answered Successfully...",
                showConfirmButton: false,
                timer: 1500
            })
        }
        else if(resJSON.operation == "Declined")
        {
            Swal.fire({
                position: 'top-right',
                icon: 'warning',
                title: "Answer Declined.",
                showConfirmButton: false,
                timer: 1500
            })
        }
        else
        {
            Swal.fire({
                position: 'top-right',
                icon: 'success',
                title: "Answer Added for Approval.",
                showConfirmButton: false,
                timer: 1500
            })
        }
    }
    location.reload();
}