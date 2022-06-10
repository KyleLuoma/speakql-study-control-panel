

export default async function SaveAttempt(idattemptsubmissions, isCorrect) {
    // console.log("getNextPrompt postRequestOptions:", studyApiPostRequestOptions);

    var studyApiHost = 'http://127.0.0.1:5000';
    if(process.env.NODE_ENV === 'production') {
        studyApiHost = 'https://speakqlapi.jp8.dev';
    }

    const isCorrectString = isCorrect ? 'true' : 'false';

    var studyApiPostRequestOptions = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: { 
            'Cache-Control' : 'no-store',
            'Content-Type': 'application/json', 
            'Accept' : '*/*',
            'Accept-Encoding' : 'gzip, deflate, br'
        },
        body: JSON.stringify({
            idattemptsubmissions: idattemptsubmissions,
            iscorrect: isCorrectString
        })
    };

    try {
        const response = await fetch(studyApiHost + "/study/save_attempt", studyApiPostRequestOptions);
        const responseJson = await response.json();
        console.log(responseJson);
        return responseJson;
    } catch (error) {
        console.log("Error encountered when attempting to save attempt using study api!");
        console.log(error);
        return {
            msg: 'error when saving attempt'
        };
    }
}