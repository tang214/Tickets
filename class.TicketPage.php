<?php
require_once('class.SecurePage.php');
require_once('class.FlipSession.php');
require_once('app/TicketAutoload.php');
class TicketPage extends SecurePage
{
    private $is_admin;
    private $is_data;
    public  $ticket_root;
    public  $settings;

    function __construct($title)
    {
        parent::__construct($title);
        $root = $_SERVER['DOCUMENT_ROOT'];
        $script_dir = dirname(__FILE__);
        $this->ticket_root = substr($script_dir, strlen($root));
        if($this->user !== false && $this->user !== null)
        {
            $this->is_admin = $this->user->isInGroupNamed('TicketAdmins');
            $this->is_data  = $this->user->isInGroupNamed('TicketTeam');
        }
        else
        {
            $this->is_admin = false;
            $this->is_data  = false;
        }
        $this->add_tickets_css();
        $this->settings = \Tickets\DB\TicketSystemSettings::getInstance();
        if($this->settings->isTestMode())
        {
             if($this->is_admin)
             {
                 $this->addNotification('The ticket system is operating in test mode. Any entries made will be deleted before ticketing starts. To change modes turn off Test Mode on <a href="/tickets/_admin/vars.php" class="alert-link">this page</a>.',
                                        self::NOTIFICATION_WARNING);
             }
             else
             {
                 $this->addNotification('The ticket system is operating in test mode. Any entries made will be deleted before ticketing starts.', 
                                        self::NOTIFICATION_WARNING);
             }
        }
        $this->addJSByURI($this->ticket_root.'/js/tickets.js', false);
    }

    function add_links()
    {
        if($this->is_admin)
        {
            $this->addLink('Admin', $this->ticket_root.'/_admin/');
        }
        if($this->is_data)
        {
            $this->addLink('Data Entry', $this->ticket_root.'/_admin/data.php');
        }
        parent::add_links();
    }

    function add_tickets_css()
    {
        $this->addCSSByURI($this->ticket_root.'/css/tickets.css');
    }

    function print_page($header=true)
    {
        if($this->user === false || $this->user === null)
        {
            $this->body = '
<div id="content">
    <h1>You must <a href="https://profiles.burningflipside.com/login.php?return='.$this->currentURL().'">log in <span class="fa fa-sign-in"></span></a> to access the Burning Flipside Ticket system!</h1>
</div>';
            $this->add_login_form();
        }
        parent::printPage($header);
    }
}
?>
