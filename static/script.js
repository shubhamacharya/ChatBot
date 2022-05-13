// Collapsible
var coll = document.getElementsByClassName("collapsible");

for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
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

// Retrieves the response
const getHardResponse = async (userText) => { 
    let botResponse = await getBotResponse(userText)
    console.log("Bot Response"+botResponse);
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
$("#textInput").keypress(function (e) {
    if (e.which == 13) {
        getResponse();
    }
});

const getBotResponse = async(input) => {
    try{
    let res = await fetch("http://127.0.0.1:5000/" + '/predict',{
            method: 'POST',
            body: JSON.stringify({message: input}),
            mode: 'cors',
            headers:{
                'Content-Type': 'application/json'
            },
        });
    let r = await res.json();
            console.log("Get Bot Response "+r.answer);
            return r.answer
    }
    catch(error) { 
            console.error('Error:',error);
        }
}

async function changePasswd() 
{
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
 if(validationRes.isConfirmed)
 {
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
        if(response[0]!=response[1])
        {
          throw new Error("Password Not Matching.")
        }
        passwords = response
        
      }).catch(error => {
        Swal.showValidationMessage(`Password Not Matching.`)
      })
    },
    allowOutsideClick: () => !Swal.isLoading()
  })

  let change = await fetch('/api/updatePassword', 
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(passwords[0])
  }).then(final_response => {
    if(final_response.status != 200)
    {
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

  if(change.message)
  {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: change.message,
      showConfirmButton: false,
      timer: 1500
    })
  }

  }	
}

question = ""
var combineResponse

async function getEdit()
{
  question = document.getElementById('datalistOptionsInput').value
  document.getElementById('editableQuestion').value = question
  var array = new Array()
  for(var res in response)
  {
    array.push(response[res])
  }
  combineResponse = array.join('\n')
  document.getElementById('responsesTextarea').value = combineResponse
}

async function updateQuestion()
{
    let updatedQuestion = ""
    let updatedResponses = ""
   
    let tag = document.getElementById('searchTag').value

    if(questionChange)
    {
        updatedQuestion = document.getElementById("editableQuestion").value
    }

    if(responseChange)
    {
      updatedResponses = document.getElementById("responsesTextarea").value
    }

    updatedJSON = {"oldQuestion":question,"pattern":updatedQuestion,"oldResponse":combineResponse,"responses":updatedResponses,"tag":tag}

    const options = {
                    method:'POST',
                    headers: 
                    {
                      'Content-Type': 'application/json'
                    },
                    body:JSON.stringify(updatedJSON)
                  }
    let response = await fetch("/api/updateQuestion",options)
    if(response.status != 200)
    {
      console.log(response.status)
    }

    let res = await response.json()
    if(res.message)
  {
    Swal.fire({
      position: 'top-right',
      icon: 'success',
      title: res.message,
      showConfirmButton: false,
      timer: 1500
    })
  }
}
   
  