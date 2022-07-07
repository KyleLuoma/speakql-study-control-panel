
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

export default async function getNextPrompt(idparticipant, idsession) {
    // console.log("getNextPrompt postRequestOptions:", studyApiPostRequestOptions);

    studyApiPostRequestOptions['body'] = JSON.stringify({
        idparticipant: idparticipant,
        idsession: idsession
    })
    if(idparticipant > 0) {
        try {
            const response = await fetch(studyApiHost + "/study/get_next_prompt", studyApiPostRequestOptions);
            const responseJson = await response.json();
            console.log("Result from get next prompt:", responseJson);
            return responseJson;
        } catch (error) {
            console.log("Error encountered when attempting to get next prompt from study api!");
            console.log(error);
            return {
                prompt: 'Awaiting next prompt',
                language: 'speakql'
            };
        }
    } else {
        return {msg: 'Invalid participant ID'};
    }
    
}

