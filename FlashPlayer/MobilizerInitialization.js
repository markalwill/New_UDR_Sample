//--------------------------------------------------------------------
//
// Copyright 2006 NGRAIN (Canada) Corporation. All rights reserved.
// Address: Suite 250 1818 Cornwall Avenue, Vancouver, BC, V6J 1C7
// Tel: 1-866-420-1781
// Fax: 1-877-279-1422
// Email: support@ngrain.com
// Website: http://www.ngrain.com
//
// This release and related documentation are protected by copyright
// and distributed under licenses restricting its use, copying,
// distribution, and decompilation. No part of this product or related
// documentation may be reproduced in any form by any means without
// prior written authorization of NGRAIN (Canada) Corporation.
//
//--------------------------------------------------------------------

/*********************************************************************
* This method is for creating the control and add it to the main
* document body. The CLSID should be updated whenever the GUID for the
* Mobilizer control changes.
*
* Parameters:
*   1. classID: the GUID that is used to retrieve the Mobilizer control
*   2. objectID: the ID that is to be given to the Mobilizer control
*   3. width: the desired width of the Mobilizer control
*   4. height: the desired height of the Mobilizer control
*********************************************************************/
function CreateControl(classID, objectID, width, height)
{
  var mobilizerControl = document.createElement('object');
  
  document.body.appendChild(mobilizerControl);
  mobilizerControl.width = width;
  mobilizerControl.height = height;
  mobilizerControl.classid = classID;
  mobilizerControl.id = objectID;
}
