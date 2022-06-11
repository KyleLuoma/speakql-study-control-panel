

export default async function getSequenceIds() {
    // console.log("getNextPrompt postRequestOptions:", studyApiPostRequestOptions);

    var studyApiHost = 'http://127.0.0.1:5000';
    if(process.env.NODE_ENV === 'production') {
        studyApiHost = 'https://speakqlapi.jp8.dev';
    }

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
        body: JSON.stringify({})
    };

    try {
        const response = await fetch(studyApiHost + "/study/get_sequence_ids", studyApiPostRequestOptions);
        const responseJson = await response.json();
        // console.log(responseJson);
        return responseJson;
    } catch (error) {
        console.log("Error encountered when attempting to get sequence ids from study api!");
        console.log(error);
        return {
            msg: 'error when loading sequence ids'
        };
    }
}