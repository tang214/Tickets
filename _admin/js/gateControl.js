function changeDone(jqXHR)
{
    if(jqXHR.status !== 200)
    {
        console.log(jqXHR);
        alert('Unable to set Early Entry status!');
        return;
    }
    location.reload();
}

function earlyEntryChanged()
{
    var val = $('#currentEarlyEntry').val();
    $.ajax({
        url: '../api/v1/globals/vars/currentEarlyEntry',
        type: 'patch',
        dataType: 'json',
        data: JSON.stringify(val),
        processData: false,
        complete: changeDone});
}

function gotCurrent(jqXHR)
{
    if(jqXHR.status !== 200 || jqXHR.responseJSON === undefined)
    {
        console.log(jqXHR);
        alert('Unable to obtain Early Entry status!');
        return;
    }
    $('#currentEarlyEntry').val(jqXHR.responseJSON);
    $('#currentEarlyEntry').on('change', earlyEntryChanged);
}

function getCurrent()
{
    $.ajax({
        url: '../api/v1/globals/vars/currentEarlyEntry',
        type: 'get',
        dataType: 'json',
        complete: gotCurrent});
}

function gotEarlyEntry(jqXHR)
{
    if(jqXHR.status !== 200 || jqXHR.responseJSON === undefined)
    {
        console.log(jqXHR);
        getCurrent();
        return;
    }
    var data = jqXHR.responseJSON;
    var options = '';
    earlyEntry = {};
    for(i = 0; i < data.length; i++)
    {
        options+='<option value="'+data[i].earlyEntrySetting+'">'+data[i].earlyEntryDescription+'</option>';
        earlyEntry[data[i].earlyEntrySetting] = data[i].earlyEntryDescription;
    }
    $('#currentEarlyEntry').replaceWith('<select id="currentEarlyEntry" name="currentEarlyEntry" class="form-control">'+options+'</select>');
    getCurrent();
}

function initPage()
{
    $.ajax({
        url: '../api/v1/earlyEntry',
        type: 'get',
        dataType: 'json',
        complete: gotEarlyEntry});
}

$(initPage);
