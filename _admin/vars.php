<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once('class.TicketAdminPage.php');
$page = new TicketAdminPage('Burning Flipside - Tickets');

$page->addWellKnownJS(JS_DATATABLE);
$page->addWellKnownCSS(CSS_DATATABLE);
$page->addJSByURI('js/vars.js');

    $page->body .= '
<div id="content">
    <ul class="nav nav-tabs" role="tablist" id="tabs">
        <li class="active"><a href="#tab1" role="tab" data-toggle="tab">Known Variables</a></li>
        <li><a href="#tab2" role="tab" data-toggle="tab">Raw View</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="tab1">
            <form class="form-horizontal" id="known" role="form">
                <fieldset>
                    <legend>Things that change often</legend>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="year">Ticket Year</label>
                        <div class="col-sm-8">
                            <div class="input-group">
                                <input type="text" class="form-control" id="year" name="year"/>
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-default" id="known_change_year" for="year" onclick="known_change(this)"><span class="fa fa-check"></span></button>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="test_mode">Test Mode</label>
                        <div class="col-sm-8">
                            <select class="form-control" id="test_mode" name="test_mode" onchange="known_change(this)">
                                <option value="0">Off</option>
                                <option value="1">On</option>
                            </select>
                        </div>
                        <div class="col-sm-2">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="request_start_date">Start Date for Request Window</label>
                        <div class="col-sm-8">
                            <input type="date" class="form-control" id="request_start_date" name="request_start_date" onchange="known_change(this)"/>
                        </div>
                        <div class="col-sm-2">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="mail_start_date">Start Date for Mail Window</label>
                        <div class="col-sm-8">
                            <input type="date" class="form-control" id="mail_start_date" name="mail_start_date" onchange="known_change(this)"/>
                        </div>
                        <div class="col-sm-2">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="request_stop_date">Stop Date for Request/Mail Window</label>
                        <div class="col-sm-8">
                            <input type="date" class="form-control" id="request_stop_date" name="request_stop_date" onchange="known_change(this)"/>
                        </div>
                        <div class="col-sm-2">
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Things that change rarely</legend>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="max_tickets_per_request">Max Tickets Allowed Per Request</label>
                        <div class="col-sm-8">
                            <div class="input-group">
                                <input type="text" class="form-control" id="max_tickets_per_request" name="max_tickets_per_request"/>
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-default" id="known_change_max_tickets_per_request" for="max_tickets_per_request" onclick="known_change(this)"><span class="fa fa-check"></span></button>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-2 control-label" for="max_buckets">Number of Ticket Processing Buckets (min is 3)</label>
                        <div class="col-sm-8">
                            <div class="input-group">
                                <input type="text" class="form-control" id="max_buckets" name="max_buckets"/>
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-default" id="known_change_max_buckets" for="max_buckets" onclick="known_change(this)"><span class="fa fa-check"></span></button>
                                </span>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
        <div class="tab-pane" id="tab2">
            <table id="raw" class="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Variable Name</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
</div>
';

$page->print_page();
// vim: set tabstop=4 shiftwidth=4 expandtab:

