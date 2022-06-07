function getdate(){
    const today = new Date();
    const currDate = today.getDay(); 
    var day = "";

    var options = {
        weekday : 'long',
        day: 'numeric',
        month:'long'
    }

    // day = today.toLocaleDateString("en-US", options); 
    day = today.toLocaleDateString("hi-IN", options); 
    // day = today.toLocaleDateString("ja-JP", options);
    return day;
}

module.exports = getdate;