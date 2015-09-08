<?php
namespace Tickets\Flipside;

class FlipsideTicketRequest extends \SerializableObject
{
    function __construct($data = false)
    {
        if($data !== false)
        {
            foreach($data as $key=>$value)
            {
                $this->$key = $value;
            }
        }
    }

    static function createTicketRequest($request)
    {
         $settings = \Tickets\DB\TicketSystemSettings::getInstance();
         if(!isset($request->year))
         {
              $request->year = $settings['year'];
         }
         $request->test = $settings['test_mode'];
         try
         {
             $old_request = static::getByIDAndYear($request->request_id, $request->year);
             if($old_request !== false)
             {
                  return static::updateRequest($request, $old_request);
             }
         }
         catch(\Exception $e) {var_dump($e); die();}
         $request->total_due = 0;
         if(isset($request->donations) && count((array)$request->donations) > 0)
         {
             $donations = (array)$request->donations;
             foreach($donations as $key=>$value)
             {
                 if($value->amount > 0)
                 {
                     $array = array();
                     $array['request_id'] = $request->request_id;
                     $array['year']       = $request->year;
                     $array['type']       = $key;
                     $array['amount']     = $value->amount;
                     if(isset($value->disclose))
                     {
                         $array['disclose'] = 1;
                     }
                     else
                     {
                         $array['disclose'] = 0;
                     }
                     $array['test']       = $request->test;
                     $donationDataTable->create($array);
                     $request->total_due += $value->amount;
                 }
             }
             unset($donations); unset($request->donations);
         }
         if(isset($request->tickets))
         {
             $count = count($request->tickets);
             for($i = 0; $i < $count; $i++)
             {
                 $array = array();
                 $array['request_id'] = $request->request_id;
                 $array['year']       = $request->year;
                 $array['first']      = $request->tickets[$i]->first;
                 $array['last']       = $request->tickets[$i]->last;
                 $array['type']       = $request->tickets[$i]->type;
                 $array['test']       = $request->test;
                 $requestedTicketDataTable->create($array);
                 $request->total_due += \Tickets\TicketType::getCostForType($request->tickets[$i]->type);
             }
             unset($request->tickets);
         }
         if(isset($request->lists) && count((array)$request->lists) > 0)
         {
             //TODO Email lists
             unset($request->lists);
         }
         return $requestDataTable->create((array)$request);
    }

    static function updateRequest($new_request, $old_request)
    {
        $old_json = json_decode($old_request->revisions);
        unset($old_request->revisions);
        if($old_json === null)
        {
            $old_json = array();
        }
        array_unshift($old_json, $old_request);
        $new_request->revisions = json_encode($old_json);
        $new_request->total_due = 0;
        $dataSet = \DataSetFactory::get_data_set('tickets');
        if(isset($new_request->donations) && count((array)$new_request->donations) > 0)
        {
            $donationDataTable = $dataSet['RequestDonation'];
            //TODO lookup any old donations and edit
            $old_count = count((array)$old_request->donations);
            for($i = 0; $i < $old_count; $i++)
            {
                foreach((array)$new_request->donations as $donation=>$data)
                {
                    if($old_request->donations[$i]['type'] === $donation)
                    {
                        $new_request->total_due += $data->amount;
                        if($old_request->donations[$i]['amount'] != $data->amount)
                        {
                            $old_request->donations[$i]['amount'] = $data->amount;
                            if(isset($data->disclose))
                            {
                                $old_request->donations[$i]['disclose'] = 1;
                            }
                            else
                            {
                                $old_request->donations[$i]['disclose'] = 0;
                            }
                            $filter = new \Data\Filter('donation_id eq '.$old_request->donations[$i]['donation_id']);
                            $donationDataTable->update($filter, $old_request->donations[$i]);
                        }
                        $old_request->donations[$i] = null;
                        unset($new_request->donations->$donation);
                    }
                }
            }
            for($i = 0; $i < $old_count; $i++)
            {
                 if($old_request->donations[$i] === null)
                 {
                     unset($old_request->donations[$i]);
                 }
            }
            $old_count = count($old_request->donations);
            $new_count = count((array)$new_request->donations);
            if($old_count !== 0 || $new_count !== 0)
            {
                if($old_count > 0) $old_request->tickets = array_values($old_request->tickets);
                print_r($old_request->donations);
                print_r($new_request->donations);
                die();
            }
        }
        else
        {
            $donationDataTable = $dataSet['RequestDonation'];
            $old_count = count((array)$old_request->donations);
            for($i = 0; $i < $old_count; $i++)
            {
                $filter = new \Data\Filter('donation_id eq '.$old_request->donations[$i]['donation_id']);
                $donationDataTable->delete($filter);
            }
        }
        if(isset($new_request->donations))
        {
            unset($new_request->donations);
        }
        if(isset($new_request->tickets))
        {
             $old_count = count($old_request->tickets);
             $new_count = count($new_request->tickets);
             for($i = 0; $i < $old_count; $i++)
             {
                 for($j = 0; $j < $new_count; $j++)
                 {
                     if($new_request->tickets[$j] === null) continue;
                     if($old_request->tickets[$i]['type'] === $new_request->tickets[$j]->type &&
                        $old_request->tickets[$i]['last'] === $new_request->tickets[$j]->last &&
                        $old_request->tickets[$i]['first'] === $new_request->tickets[$j]->first)
                     {
                         $new_request->total_due += \Tickets\TicketType::getCostForType($new_request->tickets[$j]->type);
                         $old_request->tickets[$i] = null;
                         $new_request->tickets[$j] = null;
                     }
                 }
             }
             for($i = 0; $i < $old_count; $i++)
             {
                 if($old_request->tickets[$i] === null)
                 {
                     unset($old_request->tickets[$i]);
                 }
             }
             for($i = 0; $i < $new_count; $i++)
             {
                 if($new_request->tickets[$i] === null)
                 {
                     unset($new_request->tickets[$i]);
                 }
             }
             $old_count = count($old_request->tickets);
             $new_count = count($new_request->tickets);
             if($old_count > 0) $old_request->tickets = array_values($old_request->tickets);
             if($new_count > 0) $new_request->tickets = array_values($new_request->tickets);
             if($old_count !== 0 || $new_count !== 0)
             {
                 $requestedTicketDataTable = $dataSet['RequestedTickets'];
                 if($old_count > 0 && $new_count > 0)
                 {
                     //Replace any old tickets with the values from the new tickets
                     $count = min($old_count, $new_count);
                     for($i = 0; $i < $count; $i++)
                     {
                          //TODO replace old ticket with new and unset both
                          $filter = new \Data\Filter('requested_ticket_id eq '.$old_request->tickets[$i]['requested_ticket_id']);
                          $array = array();
                          $array['first']      = $new_request->tickets[$i]->first;
                          $array['last']       = $new_request->tickets[$i]->last;
                          $array['type']       = $new_request->tickets[$i]->type;
                          $requestedTicketDataTable->update($filter, $array);
                          $new_request->total_due += \Tickets\TicketType::getCostForType($new_request->tickets[$i]->type);
                     }
                     $old_count = count($old_request->tickets);
                     $new_count = count($new_request->tickets);
                     if($old_count > 0) $old_request->tickets = array_values($old_request->tickets);
                     if($new_count > 0) $new_request->tickets = array_values($new_request->tickets);
                 }
                 if($new_count > 0)
                 {
                     for($i = 0; $i < $new_count; $i++)
                     {
                         $array = array();
                         $array['request_id'] = $new_request->request_id;
                         $array['year']       = $new_request->year;
                         $array['first']      = $new_request->tickets[$i]->first;
                         $array['last']       = $new_request->tickets[$i]->last;
                         $array['type']       = $new_request->tickets[$i]->type;
                         $array['test']       = $new_request->test;
                         $requestedTicketDataTable->create($array);
                         $new_request->total_due += \Tickets\TicketType::getCostForType($new_request->tickets[$i]->type);
                     }
                 }
                 if($old_count > 0)
                 {
                     for($i = 0; $i < $old_count; $i++)
                     {
                         $filter = new \Data\Filter('requested_ticket_id eq '.$old_request->tickets[$i]['requested_ticket_id']);
                         $requestedTicketDataTable->delete($filter);
                     }
                 }
             }
             unset($new_request->tickets);
        }
        if(isset($new_request->lists) && count((array)$new_request->lists) > 0)
        {
             //TODO Email lists
             unset($new_request->lists);
        }
        $requestDataTable = $dataSet['TicketRequest'];
        $filter = new FlipsideRequestDefaultFilter($new_request->request_id, $new_request->year);
        return $requestDataTable->update($filter, (array)$new_request);
    }

    static function getByIDAndYear($request_id, $year)
    {
         $filter = new FlipsideRequestDefaultFilter($request_id, $year);
         $dataSet = \DataSetFactory::get_data_set('tickets');
         $requestDataTable = $dataSet['TicketRequest'];
         $donationDataTable = $dataSet['RequestDonation'];
         $requestedTicketDataTable = $dataSet['RequestedTickets'];
         $requests = $requestDataTable->read($filter);
         if($requests !== false && isset($requests[0]))
         {
             $requests[0]['tickets']   = $requestedTicketDataTable->read($filter);
             $requests[0]['donations'] = $donationDataTable->read($filter);
             return new static($requests[0]);
         }
         throw new \Exception('Not found');
    }
}
?>
