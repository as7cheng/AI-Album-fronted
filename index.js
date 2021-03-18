var albumBucketName = "picswithindice";
var bucketRegion = "us-east-1";
var IdentityPoolId = "us-east-1:11bce490-5db4-41f1-a4ac-7a4aaccb75c9";

AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
    })
});

var s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: albumBucketName }
});

function runSpeechRecognition() {
    // get output div reference
    var output = document.getElementById("output");
    // get action element reference
    var action = document.getElementById("action");
    // new speech recognition object
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();


    recognition.onspeechend = function () {
        recognition.stop();
    }

    // This runs when the speech recognition service returns result
    recognition.onresult = function (event) {
        var transcript = event.results[0][0].transcript;
        output.innerHTML = transcript;
    };

    // start recognition
    recognition.start();
}

function moveContent() {
    document.getElementById("output").innerHTML = " ";
}


function search() {

    var apigClient = apigClientFactory.newClient();

    var image_message = document.getElementById("searchText").value;
    console.log(image_message);
    if (image_message == "")
        image_message = document.getElementById("output").value;
    console.log(image_message);


    var params = {
        "q": image_message,
    };

    console.log(params);

    apigClient.searchGet(params, {}, {}).then(function (result) {
            console.log("i'm in")
            response_data = result.data;
            console.log(response_data);
            length_of_response = response_data.length;

            if (length_of_response == 0) {
                document.getElementById("displaytext").innerHTML = "No Images Found !!!";
                document.getElementById("displaytext").style.display = "block";
            }

            let images = result.data;
            for (var i = 0; i < images.length; i++) {
                var img_url = images[i];
                var img = document.createElement('img');
                img.src = img_url;
                img.width = 500;
                document.getElementById("img-container").appendChild(img);
            }
        
        }).catch(function (result) {
            console.log(result);
        });

}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
            if ((encoded.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
}

function addPhoto(albumName) {
    var files = document.getElementById('file_path').files;
    var customLabels = document.getElementById('label').value;
    console.log(files);
    console.log(customLabels);
    var file = files[0];
    console.log(file)
    var fileName = file.name;

    var photoKey = fileName;

    // Use S3 ManagedUpload class as it supports multipart uploads
    var upload = new AWS.S3.ManagedUpload({
        params: {
            Bucket: albumBucketName,
            Key: photoKey,
            Body: file,
            MetaData: customLabels
        }
    });

    var promise = upload.promise();

    promise.then(
        function (data) {
            alert("Successfully uploaded photo.");
        },
        function (err) {
            return alert("There was an error uploading your photo: ", err.message);
        }
    );
}