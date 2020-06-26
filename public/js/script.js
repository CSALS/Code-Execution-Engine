function ready() {
    
}

function submit() {
    console.log("submitting the code")
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ 
        "code": document.getElementById("code").value,
        "input": document.getElementById("input").value, 
        "language": document.getElementById("language").value 
    });

    console.log(raw);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://localhost:5001/execute", requestOptions)
        .then(response => response.text())
        .then(result => {console.log(result); document.getElementById("output").innerHTML = result;})
        .catch(error => console.log('error', error));
}