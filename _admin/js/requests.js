function change_year(control)
{
    var data = 'all='+$(control).val();
    var table = $('#requests').DataTable();
    table.ajax.url('/tickets/ajax/request.php?'+data).load();
}

function ticket_count(row, type, val, meta)
{
    return row.tickets.length;
}

function total_due(row, type, val, meta)
{
    var total = 0;
    if(row.tickets !== undefined)
    {
        for(i = 0; i < row.tickets.length; i++)
        {
            total += row.tickets[i].type.cost*1;
        }
    }
    if(row.donations !== undefined)
    {
        for(i = 0; i < row.donations.length; i++)
        {
            total += row.donations[i].amount*1;
        }
    }
    return '$'+total;
}

function child_data(row, type, val, meta)
{
    var res = '';
    if(row.tickets !== undefined)
    {
        for(i = 0; i < row.tickets.length; i++)
        {
            res += row.tickets[i].first+' '+row.tickets[i].last+' ';
        }
    }
    return res;
}

function draw_done()
{
    $('td.details-control').html('<span class="glyphicon glyphicon-plus"></span>');
}

function show_tickets(data)
{
    var ret = '<table class="table">';
    ret += '<thead>';
    ret += '<th>Ticket</th>';
    ret += '<th>First Name</th>';
    ret += '<th>Last Name</th>';
    ret += '<th>Type</th>';
    ret += '</thead>';
    ret += '<tbody>';
    if(data.tickets !== undefined)
    {
        for(i = 0; i < data.tickets.length; i++)
        {
            ret += '<tr><td>'+(i*1 + 1)+'</td><td>'+data.tickets[i].first+'</td><td>'+data.tickets[i].last+'</td><td>'+data.tickets[i].type.typeCode+'</td></tr>';
        }
    }
    ret += '</tbody>';
    ret += '</table>';
    return ret;
}

function details_clicked()
{
    var tr = $(this).closest('tr');
    var row = $('#requests').DataTable().row(tr);
    if(row.child.isShown())
    {
        row.child.hide();
        $(this).html('<span class="glyphicon glyphicon-plus"></span>');
        tr.removeClass('shown');
    }
    else
    {
        row.child(show_tickets(row.data())).show();
        $(this).html('<span class="glyphicon glyphicon-minus"></span>');
        tr.addClass('shown');
    }
}

function save_request(control)
{
    var form = $('#request_edit_form');
    console.log(form.serialize());
}

function row_clicked()
{
    var tr = $(this).closest('tr');
    var row = $('#requests').DataTable().row(tr);
    var data = row.data();
    $('#modal').modal();
    $('#modal_title').html('Request #'+data.request_id);
    $('#request_id').val(data.request_id);
    $('#givenName').val(data.givenName);
    $('#sn').val(data.sn);
    $('#mail').val(data.mail);
    $('#c').val(data.c);
    $('#mobile').val(data.mobile);
    $('#street').val(data.street);
    $('#zip').val(data.zip);
    $('#l').val(data.l);
    $('#st').val(data.st);
    $('#ticket_table tbody').empty();
    for(i = 0; i < data.tickets.length; i++)
    {
        var new_row = $('<tr/>');
        $('<td/>').html('<input type="text" id="ticket_first_'+i+'" name="ticket_first_'+i+'" class="form-control" value="'+data.tickets[i].first+'"/>').appendTo(new_row);
        $('<td/>').html('<input type="text" id="ticket_last_'+i+'" name="ticket_last_'+i+'" class="form-control" value="'+data.tickets[i].last+'"/>').appendTo(new_row);
        $('<td/>').html('<input type="text" id="ticket_type_'+i+'" name="ticket_type_'+i+'" class="form-control" value="'+data.tickets[i].type.typeCode+'"/>').appendTo(new_row);
        new_row.appendTo($('#ticket_table tbody'));
    }
    $('#donation_table tbody').empty();
    if(data.donations !== undefined)
    {
        for(i = 0; i < data.donations.length; i++)
        {
            var new_row = $('<tr/>');
            $('<td/>').html(data.donations[i].type.entityName).appendTo(new_row);
            $('<td/>').html('<input type="text" id="ticket_type_'+data.donations[i].type.entityName+'" name="ticket_type_'+data.donations[i].type.entityName+'" class="form-control" value="'+data.donations[i].amount+'"/>').appendTo(new_row);
            new_row.appendTo($('#donation_table tbody'));
        }
    }
}

function init_page()
{
    $('#requests').dataTable({
        columns: [
            {'class': 'details-control', 'orderable': false, 'data': null, 'defaultContent': ''},
            {'data': 'request_id'},
            {'data': 'givenName'},
            {'data': 'sn'},
            {'data': ticket_count},
            {'data': total_due},
            {'data': child_data, 'visible': false}
        ]
    });
    $('#requests').on('draw.dt', draw_done);
    $('#requests tbody').on('click', 'td.details-control', details_clicked);
    $('#requests tbody').on('click', 'td:not(.details-control)', row_clicked);
    change_year($('#year'));
}

$(init_page);