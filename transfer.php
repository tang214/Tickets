<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once('class.TicketPage.php');
require_once('class.Ticket.php');
$page = new TicketPage('Burning Flipside - Tickets');

$page->add_js_from_src('/js/jquery.dataTables.js');
$page->add_js_from_src('js/transfer.js');

$css_tag = $page->create_open_tag('link', array('rel'=>'stylesheet', 'href'=>'/css/jquery.dataTables.css', 'type'=>'text/css'), true);
$page->add_head_tag($css_tag);

function ticket_id_entry_form()
{
    return '<div id="content">
                <form method="GET" action="transfer.php">
                    <div class="form-group">
                        <label for="id" class="col-sm-2 control-label">Ticket ID:</label>
                        <div class="col-sm-10">
                            <input class="form-control" type="text" name="id" id="id" data-toggle="tooltip" data-placement="top" title="The ticket ID can take two forms. One form is a 32-character string of letters and numbers. The other form is an 8 character string followed by approximately 8 words. You may enter either value here."/>
                        </div>
                    </div>
                    <button type="submit" name="submit" class="btn btn-primary">Lookup Ticket</button>
                </form>
            </div>';
}

if(!FlipSession::is_logged_in())
{
    $page->body .= '
<div id="content">
    <h1>You must log in to access the Burning Flipside Ticket system!</h1>
</div>';
}
else
{
    if(isset($_GET['id']))
    {
        $hash = $_GET['id'];
        if(strpos($hash, ' ') !== FALSE)
        {
            $hash = Ticket::words_to_hash($hash); 
        }
        $ticket = Ticket::get_ticket_by_hash($hash);
        if($ticket == FALSE)
        {
            $page->add_notification('The specified ticket does not exist!. Please enter the ID again. If this error persists then please contact the <a href="mailto:tickets@burningflipside.com" class="alert-link">Flipside Ticket Team</a>.', 
                                    TicketPage::NOTIFICATION_FAILED);
            $page->body .= ticket_id_entry_form();
        }
        else
        {
            if(Ticket::user_has_ticket($hash, FlipSession::get_user(TRUE)))
            {
                /*This user already owns the ticket. Let them send it to someone else or just change the name*/
                $page->body .= '<div id="content">
                                    <input class="form-control" type="hidden" name="hash" id="hash" value="'.$hash.'"/>
                                    <formset>
                                        <legend>Change Name</legend>
                                        <div class="form-group">
                                            <label for="firstName" class="col-sm-2 control-label">First Name:</label>
                                            <div class="col-sm-10">
                                                <input class="form-control" type="text" name="firstName" id="firstName" data-toggle="tooltip" data-placement="top" title="The first name that matches the legal photo ID that will be presented at the Burning Flipside gate." value="'.$ticket[0]->firstName.'"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="lastName" class="col-sm-2 control-label">Last Name:</label>
                                            <div class="col-sm-10">
                                                <input class="form-control" type="text" name="lastName" id="lastName" data-toggle="tooltip" data-placement="top" title="The last name that matches the legal photo ID that will be presented at the Burning Flipside gate." value="'.$ticket[0]->lastName.'"/>
                                            </div>
                                        </div>
                                        <button type="button" class="btn btn-primary" onclick="change_name()">Change Name</button>
                                    </formset>
                                    <formset>
                                        <legend>Change Ownership</legend>
                                        <div class="form-group">
                                            <label for="email" class="col-sm-2 control-label">Email:</label>
                                            <div class="col-sm-10">
                                                <input class="form-control" type="text" name="email" id="email" data-toggle="tooltip" data-placement="top" title="The email to send the ticket to." value="'.$ticket[0]->email.'"/>
                                            </div>
                                        </div>
                                        <button type="button" class="btn btn-primary" onclick="transfer()">Transfer Tickets</button>
                                    </formset>
                                </div>';

            }
            else
            {
                /*This user does not own the ticket yet, but has the full id. Let them attempt to claim it*/
                $page->body .= '<div id="content">
                                Transfer to...
                                </div>';
            }
        }
    }
    else
    {
        /*No id, but logged on. Let them enter an ID and repost*/
        $page->body .= ticket_id_entry_form();
    }
}
$page->print_page();
// vim: set tabstop=4 shiftwidth=4 expandtab:
?>
