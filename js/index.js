var out_of_window = false;
var test_mode = false;
var ticket_year = false;
var font_face_support = undefined;

function tableDrawComplete()
{
    $("#ticket_set").show();
    if($("#ticketList").DataTable().data().length !== 0)
    {
    }
    if($(window).width() < 768)
    {
        $('#ticketList th:nth-child(3)').hide();
        $('#ticketList td:nth-child(3)').hide();
        $('#ticketList th:nth-child(4)').hide();
        $('#ticketList td:nth-child(4)').hide();
    }
}

function get_words_done(data)
{
    $('#long_id_words').html(data.hash_words);
}

function show_long_id(hash)
{
    $('#long_id').html(hash);
    $('#long_id_words').html('');
    $.ajax({
        url: 'api/v1/tickets/'+hash+'?select=hash_words',
        type: 'get',
        dataType: 'json',
        success: get_words_done});
    $('#ticket_view_modal').modal('hide');
    $('#ticket_id_modal').modal('show');
}

function get_ticket_data_by_hash(hash)
{
    var json = $("#ticketList").DataTable().ajax.json();
    var ticket = null;
    var i;
    for(i = 0; i < json.data.length; i++)
    {
        if(json.data[i].hash === hash)
        {
            ticket = json.data[i];
        }
    }
    if(ticket === null)
    {
        json = $('#discretionary').DataTable().ajax.json();
        for(i = 0; i < json.data.length; i++)
        {
            if(json.data[i].hash === hash)
            {
                ticket = json.data[i];
            }
        }
    }
    return ticket;
}

function view_ticket(control)
{
    var jq = $(control);
    var id = jq.attr('for');
    var ticket = get_ticket_data_by_hash(id);
    if(ticket === null)
    {
        alert('Cannot find ticket');
        return;
    }
    $('[title]').tooltip('hide');
    $('#view_first_name').html(ticket.firstName);
    $('#view_last_name').html(ticket.lastName);
    $('#view_type').html(ticket.type);
    $('#view_short_code').html(ticket.hash.substring(0,7)).attr('onclick', 'show_long_id(\''+ticket.hash+'\')');
    $('#ticket_view_modal').modal('show');
}

function save_ticket_done(data)
{
    if(data.error !== undefined)
    {
        alert(data.error);
        return;
    }
    else
    {
        console.log(data);
        //location.reload();
    }
}

function save_ticket()
{
    $.ajax({
        url: 'api/v1/tickets/'+$('#show_short_code').data('hash'),
        type: 'patch',
        data: '{"firstName":"'+$('#edit_first_name').val()+'","lastName":"'+$('#edit_last_name').val()+'"}',
        processData: false,
        dataType: 'json',
        success: save_ticket_done});
    $('#ticket_edit_modal').modal('hide');
}

function edit_ticket(control)
{
    var jq = $(control);
    var id = jq.attr('for');
    var ticket = get_ticket_data_by_hash(id);
    if(ticket === null)
    {
        alert('Cannot find ticket');
        return;
    }
    $('[title]').tooltip('hide');
    $('#edit_first_name').val(ticket.firstName);
    $('#edit_last_name').val(ticket.lastName);
    $('#show_short_code').val(ticket.hash.substring(0,8)).data('hash', id);
    $('#ticket_edit_modal').modal('show');
}

function download_ticket_done(data)
{
    if(data.pdf !== undefined)
    {
        var win = window.open(data.pdf, '_blank');
        if(win === undefined)
        {
            alert('Popups are blocked! Please enable popups.');
        }
    }
}

function download_ticket(control)
{
    var jq = $(control);
    var id = jq.attr('for');
    var win = window.open('api/v1/tickets/'+id+'/pdf', '_blank');
    
}

function transfer_ticket(control)
{
    var jq = $(control);
    var id = jq.attr('for');
    var ticket = get_ticket_data_by_hash(id);
    if(ticket === null)
    {
        alert('Cannot find ticket');
        return;
    }
    window.location = 'transfer.php?id='+ticket.hash;
}

function short_hash(data, type, row, meta)
{
    return '<a href="#" onclick="show_long_id(\''+data+'\')">'+data.substring(0,8)+'</a>';
}

function getOuterHTML(button)
{
    if(button.prop('outerHTML') === undefined)
    {
        return new XMLSerializer().serializeToString(button[0]);
    }
    return button.prop('outerHTML');
}

function makeGlyphButton(options, glyphClass)
{
    options.type = 'button';
    var button = $('<button/>', options);
    var glyph = $('<span/>', {'class': glyphClass});
    glyph.appendTo(button);
    return getOuterHTML(button);
}

function makeGlyphLink(options, glyphClass)
{
    var link = $('<a/>', options);
    var glyph = $('<span/>', {'class': glyphClass});
    glyph.appendTo(link);
    return getOuterHTML(link);
}

function makeTextLink(options, linkText)
{
    var link = $('<a/>', options);
    link.append(linkText);
    return getOuterHTML(link);
}

function getViewButton()
{
    var view_options = {'class': 'btn btn-link btn-sm', 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'View Ticket Code', 'for': data, onclick: 'view_ticket(this)'};
    if(font_face_support === true)
    {
        return makeGlyphButton(view_options, 'fa fa-search');
    }
    return makeTextLink(view_options, 'View')+'|';
}

function getEditButton()
{
    var edit_options = {'class': 'btn btn-link btn-sm', 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'Edit Ticket<br/>Use this option to keep the ticket<br/>on your account but<br/>change the legal name.', 'data-html': true, 'for': data, onclick: 'edit_ticket(this)'};
    if(font_face_support === true)
    {
        return makeGlyphButton(edit_options, 'fa fa-pencil');
    }
    return makeTextLink(edit_options, 'Edit')+'|';
}

function getPDFButton()
{
    var pdf_options =  {'class': 'btn btn-link btn-sm', 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'Download PDF', 'for': data, href: 'api/v1/tickets/'+data+'/pdf', target: '_blank'};
    if(font_face_support === true)
    {
        return makeGlyphLink(pdf_options, 'fa fa-download');
    }
    return makeTextLink(pdf_options, 'Download')+'|';
}

function getTransferButton()
{
    var transfer_options = {'class': 'btn btn-link btn-sm', 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'Transfer Ticket<br/>Use this option to send<br/>the ticket to someone else', 'data-html': true, 'for': data, onclick: 'transfer_ticket(this)'};
    if(font_face_support === true)
    {
        return makeGlyphButton(transfer_options, 'fa fa-send');
    }
    return makeTextLink(transfer_options, 'Transfer');
}

function make_actions(data, type, row, meta)
{
    var res = '';
    if(font_face_support === undefined)
    {
        font_face_support = browser_supports_font_face();
    }
    if($(window).width() < 768)
    {
        res += getViewButton();
    }
    res += getEditButton();
    res += getPDFButton();
    res += getTransferButton();
    return res;
}

function init_table()
{
    $('#ticketList').dataTable({
        "ajax": 'api/v1/ticket?fmt=data-table',
        columns: [
            {'data': 'firstName'},
            {'data': 'lastName'},
            {'data': 'type'},
            {'data': 'hash', 'render': short_hash},
            {'data': 'hash', 'render': make_actions, 'class': 'action-buttons', 'orderable': false}
        ],
        paging: false,
        info: false,
        searching: false
    });

    $("#ticketList").on('draw.dt', tableDrawComplete);
}

function edit_request(control)
{
    var jq = $(control);
    var tmp = jq.attr('for');
    var ids = tmp.split('_');
    window.location = 'request.php?request_id='+ids[0]+'&year='+ids[1];
}

function email_request_done(data)
{
    console.log(data);
}

function email_request(control)
{
    var jq = $(control);
    var tmp = jq.attr('for');
    var ids = tmp.split('_');
    $.ajax({
        url: 'api/v1/request/'+ids[0]+'/'+ids[1]+'/Actions/Requests.SendEmail',
        type: 'post',
        dataType: 'json',
        complete: email_request_done});
}

function download_request(control)
{
    var jq = $(control);
    var tmp = jq.attr('for');
    var ids = tmp.split('_');
    location = 'api/v1/request/'+ids[0]+'/'+ids[1]+'/pdf';
}

function add_buttons_to_row(row, id, year)
{
    if(font_face_support === undefined)
    {
        font_face_support = browser_supports_font_face();
    }
    var cell = $('<td/>', {style: 'white-space: nowrap;'});
    var edit_options = {'class': 'btn btn-link btn-sm', 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'Edit Request', 'for': id+'_'+year, onclick: 'edit_request(this)'};
    var mail_options = {'class': 'btn btn-link btn-sm', 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'Resend Request Email', 'for': id+'_'+year, onclick: 'email_request(this)'};
    var pdf_options =  {'class': 'btn btn-link btn-sm', 'data-toggle': 'tooltip', 'data-placement': 'top', title: 'Download PDF', 'for': id+'_'+year, onclick: 'download_request(this)'};
    var html;
    if(font_face_support === true)
    {
        html = makeGlyphButton(edit_options, 'fa fa-pencil');
        cell.append(html);

        html = makeGlyphButton(mail_options, 'fa fa-envelope');
        cell.append(html);

        html = makeGlyphButton(pdf_options, 'fa fa-download');
        cell.append(html);
    }
    else
    {
        html = makeTextLink(edit_options, 'Edit');
        cell.append(html);
        cell.append("|");

        html = makeTextLink(mail_options, 'Resend');
        cell.append(html);
        cell.append("|");

        html = makeTextLink(pdf_options, 'Download');
        cell.append(html);
    }
    cell.appendTo(row);
}

function toggle_hidden_requests(e)
{
    var rows = $('tr.old_request');
    if(rows.is(':visible'))
    {
        rows.hide();
    }
    else
    {
        rows.show();
    }
}

function copy_request(e)
{
    var request = $(e.currentTarget).data('request');
    location = 'copy_request.php?id='+request.request_id+'&year='+request.year;
}

function add_old_request_to_table(tbody, request)
{
    var container = tbody.find('tr#old_requests');
    if(container.length === 0)
    {
        tbody.prepend('<tr id="old_requests" style="cursor: pointer;"><td colspan="5"><span class="fa fa-chevron-right"></span> Old Requests</td></tr>');
        container = tbody.find('tr#old_requests');
        container.on('click', toggle_hidden_requests);
    }
    var row = $('<tr class="old_request" style="display: none;">');
    row.append('<td/>');
    row.append('<td>'+request.year+'</td>');
    row.append('<td>'+request.tickets.length+'</td>');
    row.append('<td>$'+request.total_due+'</td>');
    var cell = $('<td>');
    //var button = $('<button class="btn btn-link btn-sm" data-toggle="tooltip" data-placement="top" title="Copy Old Request"><span class="fa fa-clipboard"></span></button>');
    //button.data('request', request);
    //button.on('click', copy_request);
    //cell.append(button);
    row.append(cell);
    container.after(row);
}

function add_request_to_table(tbody, request, old_request_only)
{
    if(request.year != ticket_year)
    {
        add_old_request_to_table(tbody, request);
        return;
    }
    old_request_only.value = false;
    var row = $('<tr/>');
    row.append('<td>'+request.request_id+'</td>');
    row.append('<td>'+request.year+'</td>');
    if(request.tickets !== null)
    {
        row.append('<td>'+request.tickets.length+'</td>');
    }
    else
    {
        row.append('<td>0</td>');
    }
    if(!out_of_window || test_mode)
    {
        row.append('<td>$'+request.total_due+'</td>');
    }
    else
    {
        var cell = $('<td/>');
        cell.attr('data-original-title', request.status.description);
        cell.attr('data-container', 'body');
        cell.attr('data-toggle', 'tooltip');
        cell.attr('data-placement', 'top');
        cell.html(request.status.name);
        cell.appendTo(row);
    }
    if(!out_of_window || test_mode)
    {
        add_buttons_to_row(row, request.request_id, request.year);
    }
    else
    {
        row.append('<td></td>');
    }
    row.appendTo(tbody);
    $('[data-original-title]').tooltip();
}

function process_requests(requests)
{
    var tbody = $('#requestList tbody');
    var old_request_only = {};
    old_request_only.value = true;
    for(var i = 0; i < requests.length; i++)
    {
        add_request_to_table(tbody, requests[i], old_request_only);
    }
    if(old_request_only.value)
    {
        if(out_of_window === false)
        {
            tbody.append('<tr><td colspan="5" style="text-align: center;"><a href="request.php"><span class="fa fa-plus-square"></span> Create a new request</a></td></tr>');
            $('#fallback').hide();
        }
        else
        {
            tbody.append('<tr><td colspan="5" style="text-align: center;"></td></tr>');
        }
    }
    else
    {
        if(out_of_window === false)
        {
            tbody.append('<tr><td colspan="5" style="text-align: center;"><a href="request.php"><span class="fa fa-plus-square"></span> Create a new request</a></td></tr>');
            $('#fallback').hide();
        }
        else
        {
            tbody.append('<tr><td colspan="5" style="text-align: center;"></td></tr>');
        }
    }
    if($('[title]').length > 0)
    {
        $('[title]').tooltip();
    }
    if($(window).width() < 768)
    {
        $('#requestList th:nth-child(1)').hide();
        $('#requestList td:nth-child(1)').hide();
    }
}

function get_requests_done(jqXHR)
{
    if(jqXHR.status === 200)
    {
        if(jqXHR.responseJSON === undefined || jqXHR.responseJSON.length === 0)
        {
            if(out_of_window)
            {
                $('#requestList').empty();
            }
            else
            {
                $('#request_set').empty();
                $('#request_set').append("You do not currently have a current or previous ticket request.<br/>");
                $('#request_set').append('<a href="/tickets/request.php">Create a Ticket Request</a>');
            }
        }
        else
        {
            process_requests(jqXHR.responseJSON);
        }
        if($('#request_set').length > 0)
        {
            $('#request_set').show();
        }
    }
    else
    {
        console.log(jqXHR);
        alert('Error obtaining request!');
    }
}

function init_request()
{
    $.ajax({
        url: 'api/v1/request',
        type: 'get',
        dataType: 'json',
        complete: get_requests_done});
}

function getDateInCentralTime(date)
{
    var ret = new Date(date+" GMT-0600");
    //You can't replace this with <
    if(!(ret.getYear() > 2000))
    {
        ret = new Date(date+"T06:00:00.000Z");
    }
    return ret;
}

function proccessOutOfWindow(now, start, end, my_window)
{
    if(now < start || now > end)
    {
        var message = 'The request window is currently closed. No new ticket requests are accepted at this time.';
        if(my_window.test_mode === '1')
        {
            message += ' But test mode is enabled. Any requests created will be deleted before ticketing starts!';
            test_mode = true;
        }
        else
        {
            $('[href="request.php"]').hide();
        }
        add_notification($('#request_set'), message);
        out_of_window = true;
        if(!test_mode)
        {
            $('#requestList th:nth-child(4)').html("Request Status");
        }
    }
}

function processMailInWindow(now, mail_start, end)
{
    if(now > mail_start && now < end)
    {
        var days = Math.floor(end/(1000*60*60*24) - now/(1000*60*60*24));
        var message = 'The mail in window is currently open! ';
        if(days === 1)
        {
            message += 'You have 1 day left to mail your request!';
        }
        else if(days === 0)
        {
            message += 'Today is the last day to mail your request!';
        }
        else
        {
            message += 'You have '+days+' days left to mail your request!';
        }
        add_notification($('#request_set'), message, NOTIFICATION_WARNING);
    }
}

function get_window_done(data)
{
    var my_window = data;
    var now = new Date(Date.now());
    var start = getDateInCentralTime(my_window.request_start_date);
    var end = getDateInCentralTime(my_window.request_stop_date);
    var mail_start = getDateInCentralTime(my_window.mail_start_date);
    var server_now = getDateInCentralTime(my_window.current);
    end.setHours(23);
    end.setMinutes(59);
    ticket_year = data.year;
    if(server_now < now)
    {
        now = server_now;
    }
    proccessOutOfWindow(now, start, end, my_window);
    processMailInWindow(now, mail_start, end);
    init_request();
    init_table();
}

function init_window()
{
    $.ajax({
        url: 'api/v1/globals/window',
        type: 'GET',
        dataType: 'json',
        success: get_window_done});
}

function panel_heading_click(e)
{
    if($(this).hasClass('panel-collapsed'))
    {
        $(this).parents('.panel').find('.panel-body').slideDown();
        $(this).removeClass('panel-collapsed');
        $(this).find('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
    }
    else
    {
        $(this).parents('.panel').find('.panel-body').slideUp();
        $(this).addClass('panel-collapsed');
        $(this).find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
    }
}

function init_index()
{
    $('.panel-heading span.clickable').on("click", panel_heading_click);
    init_window();
    if(getParameterByName('show_transfer_info') === '1')
    {
        var body = $('#content');
        add_notification(body, 'You have successfully sent an email with the ticket information. The ticket will be fully transfered when the receipient logs in and claims the ticket', NOTIFICATION_SUCCESS);
    }
}

$(init_index);
