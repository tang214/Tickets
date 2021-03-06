var ticketSystem = new TicketSystem('../api/v1');

function init_table()
{
    $(this).dataTable({
        'ajax': ticketSystem.getProblemRequestDataTableUri($(this).attr('id')),
        'columns': [
            {'data': 'request_id'},
            {'data': 'private_status'},
            {'data': 'total_due'},
            {'data': 'total_received'},
            {'data': 'comments'},
            {'data': 'crit_vol'}
        ]
    });
}

function expand_table()
{
    $(this).DataTable().page.len(-1);
    $(this).DataTable().draw();
}

function before_print()
{
    $('table').each(expand_table);
}

function after_print()
{
    console.log('after');
}

function on_print_change(mql)
{
    if(mql.matches)
    {
        before_print();
    }
    else
    {
        after_print();
    }
}

function exportCSV(view)
{
    var uri = ticketSystem.getProblemRequestDataTableUri(view);
    uri = uri.replace('fmt=data-table', '$format=csv2');
    window.location = uri; 
}

function init_page()
{
    $('table').each(init_table);
    if(window.matchMedia !== undefined)
    {
        //WebKit implementation
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(on_print_change);
    }
    //IE & Firefox implementation
    window.onbeforeprint = before_print;
    window.onafterprint = after_print;
}

$(init_page);
