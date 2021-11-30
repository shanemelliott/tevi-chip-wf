
$(function () {

var steps=[]
var stepData = []
var curClincListData = {}
var duz="520824652" //520881829
var sta3n="500"//442
var showState='All'
var tokenNumber = '0'
var FilterCol = 7

document.getElementById("listDisplay").style.display = "none"
document.getElementById("dataDisplay").style.display = "none"
document.getElementById("showAll").style.display = "none"
document.getElementById("showRole").style.display = "none"

var users = [
  {"secId": "1234567890","DUZ":"520824652", "lastName": "TESTER0", "firstName": "JOHN", "email": "john.tester0@va.gov", "samAccountName": "vhatst1234567890", "jti": "c1211760-a083-4088-a55f-e02691afe1c3"},
   {"secId": "1234567890","DUZ":"520824652", "lastName": "TESTER0", "firstName": "JOHN", "email": "john.tester0@va.gov", "samAccountName": "vhatst1234567890", "jti": "c1211760-a083-4088-a55f-e02691afe1c3"},
  {"secId": "1234567891", "DUZ":"520824652","lastName": "TESTER1", "firstName": "JANE", "email": "jane.tester1@va.gov", "samAccountName": "vhatst1234567891", "jti": "914a06e6-8478-48c5-8902-a580cca0efe7"},
  {"secId": "1234567892","DUZ":"520824652", "lastName": "TESTER2", "firstName": "ROBERT", "email": "robert.tester2@va.gov", "samAccountName": "vhatst1234567892", "jti": "00e290bb-af10-4025-bac0-8e6d7402588b"},
  {"secId": "1234567893", "DUZ":"520824652","lastName": "TESTER3", "firstName": "SANDRA", "email": "sandra.tester3@va.gov", "samAccountName": "vhatst1234567893", "jti": "fcfbba2d-cbb5-4e46-9980-dbd031c0ad0b"},
  {"secId": "1234567894", "DUZ":"520824652","lastName": "TESTER4", "firstName": "WILLIAM", "email": "william.tester4@va.gov", "samAccountName": "vhatst1234567894", "jti": "4996fbcc-313f-45e2-9c36-54046f34afea"},
  {"secId": "1234567895", "DUZ":"520824652","lastName": "TESTER5", "firstName": "JACK", "email": "jack.tester5@va.gov", "samAccountName": "vhatst1234567895", "jti": "36065034-2a47-422d-b6d1-58bd412347c2"},
  {"secId": "1234567896", "DUZ":"520824652","lastName": "TESTER6", "firstName": "JOSEPH", "email": "joseph.tester6@va.gov", "samAccountName": "vhatst1234567896", "jti": "1c5e3e4c-034d-4140-b4f7-d0045b8aff89"},
  {"secId": "1234567897", "DUZ":"520824652","lastName": "TESTER7", "firstName": "SOPHIA", "email": "sophia.tester7@va.gov", "samAccountName": "vhatst1234567897", "jti": "94736ec8-5581-4ffd-9a5c-6091922ce891"},
  {"secId": "1234567898", "DUZ":"520824652","lastName": "TESTER8", "firstName": "ISABELLA", "email": "isabella.tester8@va.gov", "samAccountName": "vhatst1234567898", "jti": "f472e3a1-30f2-4ace-822d-978722b49c2e"},
  {"secId": "1234567899", "DUZ":"520824652","lastName": "TESTER9", "firstName": "VIOLET", "email": "violet.tester9@va.gov", "samAccountName": "vhatst1234567899", "jti": "d9db5b36-4090-4b32-a0b1-20a0c7fddce7"},
  {"secId": "1234567899", "DUZ":"10000000054","lastName": "MASCLERK", "firstName": "ONE", "email": "ONE.MASCLERK@va.gov", "samAccountName": "vhatSTMASCLO", "jti": "d9db5b36-4090-4b33-a0b1-20a0c7fddce7"},
  {"secId": "1234567899", "DUZ":"10000000055","lastName": "MASCLERK", "firstName": "TWO", "email": "TWO.MASCLERK@va.gov", "samAccountName": "vhatSTMASCLT", "jti": "d9db5b36-4090-4b34-a0b2-20a0c7fddce7"},
  {"secId": "1234567899", "DUZ":"10000000078","lastName": "MASCLERK", "firstName": "THREE", "email": "THREE.MASCLERK@va.gov", "samAccountName": "vhatSTMASCLTH", "jti": "d9db5b36-4092-5b32-a0b1-20a0c7fddce7"},
  {"secId": "1234567899", "DUZ":"10000000079","lastName": "MASCLERK", "firstName": "FOUR", "email": "FOUR.MASCLERK@va.gov", "samAccountName": "vhatSTMASCLF", "jti": "d9db5b36-5090-3b32-a0b1-20a0c7fddce7"},
  {"secId": "1234567899", "DUZ":"10000000080","lastName": "MASCLERK", "firstName": "FIVE", "email": "FIVE.MASCLERK@va.gov", "samAccountName": "vhatSTMASCLFI", "jti": "d9db5b36-6090-2b32-a0b1-20a0c7fddce7"}

]

function getUsers(){
  var newOptionsSelect
  users.forEach((e,i) => {
    newOptionsSelect = newOptionsSelect + '<option value="'+e.secId+'">'+e.lastName+', '+e.firstName+ '</option>';
  })
  $('#userId').append( newOptionsSelect )
}


function getLists(){
  var token={}
  $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
      token=tokenResponse
  }).then(function(token){
    $.ajaxSetup({
      headers : {
        'Authorization' : 'Bearer '+token.token,
      }
    });
    $.getJSON(
      'https://staging.api.vetext.va.gov/vsecs-api/api/v1_0_0/pcl/lists'
     //'http://localhost:4567/lists'
      ,function (response) {
       var newOptionsSelect
      response.payload.forEach((e,i) => {
        newOptionsSelect = newOptionsSelect + '<option data-sta3n="'+e.stationId+'"value="'+e.id+'">'+e.name+ '  Role:  '+e.role+'</option>';
      })
      $('#listId').append( newOptionsSelect )
    })
  })
}

function getSteps(){
  var token={}
  var steps=[]
  $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
      token=tokenResponse
  }).then(function(token){
    $.ajaxSetup({
      headers : {
        'Authorization' : 'Bearer '+token.token,
      }
    });
    $.getJSON(
      'https://dev.vse-wf-api.va.gov/api/v1/workflows'
     // 'http://internal-clinician-workflow-api-lb-dev-1492574551.us-gov-west-1.elb.amazonaws.com/api/v1/workflows'
      //'http://localhost:4567/steps'
      ,function (response) {
      response.included.forEach((e,i) => {
      var step={
          'name':e.attributes.name,
          'id':e.attributes.id
          }
         steps.push(step)
      })
      setSteps(steps)
    })
  })


}

function setSteps(data){
 stepData=data
    var StepsSelect='<option value="-1">Select Action...</option>'
  data.forEach((e) => {
        StepsSelect = StepsSelect + '<option value="'+e.id+'">'+e.name+ '</option>';
      })
      steps='<select class="form-control" id="stepSelect" style="width:240px;">'+StepsSelect+'</select>'
}

function tableFilter(){

  var data=showState
  if(data=='All'){
    $("#dataTable").find("tr").show();
    document.getElementById("showAll").style.display = "none"
    document.getElementById("showRole").style.display = ""
  }else{
    document.getElementById("showAll").style.display = ""
    document.getElementById("showRole").style.display = "none"
    var rows = $("#dataTable").find("tr").hide();
    data=data.toLowerCase()
    rows.each(function(i,x){
      if (i>0){
        var td = x.getElementsByTagName("td")[FilterCol];
        if(td){
          txtValue = td.textContent || td.innerText;
          if(txtValue.toLowerCase().indexOf(data)>-1){
            x.style.display = ""
          
          }else{
            x.style.display="none"
          
          }
        }
      }else{
        x.style.display = ""
      }
     
    })
  }
 }

$('#steps').on('click',function(){
})

$('#editLists').on('click',function(){
    //show clinic edit div
    document.getElementById("dataDisplay").style.display = "none"
    document.getElementById("listDisplay").style.display = "block"
    document.getElementById("showAll").style.display = "none"
    document.getElementById("showRole").style.display = "none"
    //get clinics from Vista Service
    //will replace later whe there is an endpoint. 
    $.getJSON('/vistaData',function (response) {
      var newOptionsSelect
      //sort list
      response.sort((a,b) => (a.RESOURCE_NAME > b.RESOURCE_NAME) ? 1 : ((b.RESOURCE_NAME > a.RESOURCE_NAME) ? -1 : 0))
      //add to option list
      response.forEach((e,i) => {
        if(e.RESOURCE_NAME){
        newOptionsSelect = newOptionsSelect + '<option value="'+e.HOSPITAL_LOCATION_ID+'">'+e.RESOURCE_NAME+ '</option>';
        }
      })
      $('#avialClinGrp').append( newOptionsSelect )
    })
    //poplate existing list. 
    $.getJSON(
        'https://staging.api.vetext.va.gov/vsecs-api/api/v1_0_0/pcl/list-items/'+document.getElementById('listId').value
        ,function (response) {
        curClincListData.list=response.payload
       console.log(response)
        var newOptionsSelect
        response.payload.forEach((e,i) => {
          newOptionsSelect = newOptionsSelect + '<option value="'+e.ien+'">'+e.name+ '</option>';
        })
        $('#currClinGrp')
        .empty()
        .append( newOptionsSelect )
      })
     
  })

  $('#getToken').on('click',function(){
    //test function
    $('#postResult').html('Getting Token');
    $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
      $('#postResult').html(JSON.stringify(tokenResponse));
  })
    
});
$('#listId').change(function(){
  var selected = $(this).find('option:selected');
 // var extra = selected.data('foo'); 
console.log(selected.val())
console.log(selected.data('sta3n'))
sta3n=selected.data('sta3n')
});

$('#showAll').on('click',function(){
 console.log(curClincListData.details)
  showState='All'
  tableFilter()
})
$('#showRole').on('click',function(){
  console.log(curClincListData.details)
  showState=curClincListData.details.role
  tableFilter()
})

$('#addItem').on('click',function(){
  var newVal =  $('#avialClinGrp').val()
  var newText= $('#avialClinGrp option:selected').text()
  if($("#currClinGrp option[value='" + newVal + "']").val() === undefined){
    $('#currClinGrp').append('<option value="'+newVal+'">'+newText+ '</option>')
  }else{
    alert('Already There')
  }
})

$('#remItem').on('click',function(){
  $("#currClinGrp option[value='"+$('#currClinGrp').val()+"']").remove();
})
 
$('#saveList').on('click',function(){
  //Get Values in List
    var currClinGrp =[]
  $('#currClinGrp option').each(function(){
      var obj={}
      var newVal =$(this).val()
      var newText= $(this).text()
      obj.name=newText
      obj.ien=newVal
      currClinGrp.push(obj)
  })
  //compare
  function comparer(otherArray){
      return function(current){
        return otherArray.filter(function(other){
          return other.ien == current.ien && other.name == current.name
        }).length == 0;
      }
    }
  var curClincListComp=[]
  curClincListData.list.forEach(function(e){
    var obj={}
    obj.name=e.name
    obj.ien=e.ien
    curClincListComp.push(obj)
  })

  var deleted = curClincListComp.filter(comparer(currClinGrp));
  var added = currClinGrp.filter(comparer(curClincListComp));
   
  console.log(deleted)
  console.log(added)

  if (added.length > 0){
      added.forEach(function(e){
      $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
        token=tokenResponse
      }).then(function(token){
        $.ajaxSetup({
          headers : {
            'Authorization' : 'Bearer '+token.token,
          }
        });
        $.ajax({
          type: 'PUT',
          url: 'https://staging.api.vetext.va.gov/vsecs-api/api/v1_0_0/pcl/list-item/'+document.getElementById('listId').value+'/'+e.ien+'/'+encodeURI(e.name),
          contentType: 'application/json',
        })
        })
      })
    }
    if(deleted.length >0){
      deleted.forEach(function(e){
      var result = $.grep(curClincListData.list, function(f){ return f.ien == e.ien; });
      $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
        token=tokenResponse
      }).then(function(token){
        $.ajaxSetup({
          headers : {
           'Authorization' : 'Bearer '+token.token,
          }
        });
        $.ajax({
          type: 'DELETE',
          url: 'https://staging.api.vetext.va.gov/vsecs-api/api/v1_0_0/pcl/list-item/'+result[0].id,
          contentType: 'application/json',
        })
      })
  })
 }
 //update Details.

 var data = {
  'id': curClincListData.details.id,
  'name': curClincListData.details.name,
  'role': $('#roleName').val(),
  'stationId': curClincListData.details.stationId,
  'userDefault': curClincListData.details.userDefault,
  'userId': curClincListData.details.userId
}



 $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
  token=tokenResponse
}).then(function(token){
 $.ajaxSetup({
  headers : {
    'Authorization' : 'Bearer '+token.token,
  }
});
$.ajax({
  type: 'POST',
  url: 'https://staging.api.vetext.va.gov/vsecs-api/api/v1_0_0/pcl/list',
  data:JSON.stringify(data),
  contentType: 'application/json',
})

})

})

$('#getList').on('click',function(){

document.getElementById("dataDisplay").style.display = "block"
document.getElementById("listDisplay").style.display = "none"
document.getElementById("showAll").style.display = "none"
document.getElementById("showRole").style.display = "inline"

 //add role
 $.getJSON(
  'https://staging.api.vetext.va.gov/vsecs-api/api/v1_0_0/pcl/lists'
  ,function (response) {

    var result = $.grep(response.payload, function(e){ return e.id == document.getElementById('listId').value; });
    curClincListData.details = result[0]
    $('#roleName').val(result[0].role)

})
  updateTable([],'dataTable')
  var token={}
  $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
      token=tokenResponse
     }).then(function(token){

    $.ajaxSetup({
      headers : {
        'Authorization' : 'Bearer '+token.token,
      }
    });
    $.getJSON(
           'https://dev.vse-wf-api.va.gov/api/v1/vista-sites/'+sta3n+'/users/'+duz+'/appointments?clinic_list_id='+document.getElementById('listId').value
      //'http://localhost:4567/list?listId='+document.getElementById('listId').value
      ,function (response) {
        console.log('found ' +response.data.length + ' Appts')
      if(response.data.length ==0 ){
        console.log("no pts")
        document.getElementById("resultDisplay").style.display = ""
        $('#postResult').html('Found ' +response.data.length + ' Appts');
      }
      updateTable(response.data,'dataTable')
      tableFilter()
    }).catch(function(err){
      console.log(err)
      $('#postResult').html(JSON.stringify(err.responseText));
    })
  })
})

$("#dataTable").on('click', '#nextStep', function() {
  var self = $(this).closest("tr");
  let thisStep= self.find(".Step").text()
  var apptIen = self.find(".appointmentIen").text();
  var clinicIen = self.find(".clinicIen").text();
  let step = stepData.find(x => x.name === thisStep);
  let nextStep = stepData[stepData.indexOf(step)+1].id
 if (nextStep){
  $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
    token=tokenResponse
   }).then(function(token){
      $.ajaxSetup({
        headers : {
          'Authorization' : 'Bearer '+token.token,
        }
      });
      $.post('https://dev.vse-wf-api.va.gov/api/v1/vista-sites/'+sta3n+'/users/'+duz+'/clinics/'+ clinicIen+ '/appointments/'+apptIen+'/status',
        {
        "workflow_step_id": nextStep,
      "_method":"put"
        },
          function(data)
          {
          if(data.data.attributes.current_status){
              self.find(".Step").text(data.data.attributes.current_status);
              tableFilter()
            }
      });
  })
 }

});
$("#userId").on('change', function() {
  alert('selectec')
})

$("#dataTable").on('change', '#stepSelect', function() {
  var self = $(this).closest("tr");
  var stepId = self.find('#stepSelect').val()
  var apptIen = self.find(".appointmentIen").text();
  var dfn = self.find(".dfn").text();
  var clinicIen = self.find(".clinicIen").text();
 // alert("Selected row values are \nappointmentIen=" + apptIen + " \ndfn=" + dfn+ " \nclinicIen=" + clinicIen+ " \nstepId=" + stepId);
if(stepId>0){
  $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
    token=tokenResponse
   }).then(function(token){
      $.ajaxSetup({
        headers : {
          'Authorization' : 'Bearer '+token.token,
        }
      });
      $.post('https://dev.vse-wf-api.va.gov/api/v1/vista-sites/'+sta3n+'/users/'+duz+'/clinics/'+ clinicIen+ '/appointments/'+apptIen+'/status',
        {
        "workflow_step_id": stepId,
      "_method":"put"
        },
          function(data)
          {
           
            if(data.data.attributes.current_status){
              self.find(".Step").text(data.data.attributes.current_status);
              tableFilter()
            }
           
      });
  })
}else{
  //alert("Selected row values are \nappointmentIen=" + apptIen + " \ndfn=" + dfn+ " \nclinicIen=" + clinicIen+ " \nstepId=" + stepId);

}
});

$("#dataTable").on('click', '#Complete', function() {
  var self = $(this).closest("tr");
  let thisStep= self.find(".Step").text()
  var apptIen = self.find(".appointmentIen").text();
  var clinicIen = self.find(".clinicIen").text();
  let step = stepData.find(x => x.name === thisStep);
  let nextStep = stepData[stepData.length-1].id
  
 if (nextStep){
  $.getJSON('/token/'+tokenNumber,function (tokenResponse) {
    token=tokenResponse
   }).then(function(token){
      $.ajaxSetup({
        headers : {
          'Authorization' : 'Bearer '+token.token,
        }
      });
      $.post('https://dev.vse-wf-api.va.gov/api/v1/vista-sites/'+sta3n+'/users/'+duz+'/clinics/'+ clinicIen+ '/appointments/'+apptIen+'/status',
        {
        "workflow_step_id": nextStep,
      "_method":"put"
        },
          function(data)
          {
           
            if(data.data.attributes.current_status){
              self.find(".Step").text(data.data.attributes.current_status);
            }
           
      });
  })
 }
  console.log(nextStep)
});

function updateTable(tdata,tableTag,filter){
  
    var data=[]
    var hiddenFields = ["appointmentIen","dfn","clinicIen"]
   
    tdata.forEach((e,i) => {
       var obj={
        'appointmentIen':e.attributes.appointmentIen,
        'dfn':e.attributes.dfn,
        'clinicIen':e.attributes.resource.clinicIen,
        'Clinic':e.attributes.clinic.name,
        'PatientName':e.attributes.patient.name,
        'NeedsInsurance':e.attributes.patient.insuranceVerify ==1 ? 'Needs Update': 'Up To Date',
        'DemographicsUpdate':e.attributes.demographicsNeedsUpdate=='true' ? 'Up To Date': 'Needs Update',
        'Step':e.attributes.workflow.currentStatus,
        'Action':'<div class="form-inline"><div class="form-group mx-sm-3 mb-2">'+steps+'  <button class="btn btn-warning" id="nextStep">Next</button>   <button class="btn btn-primary" id="Complete">Complete</button></div></div>'
        
      }
      
      data[i] = obj
     });
     tdata=data
     // EXTRACT VALUE FOR HTML HEADER. 
     var col = [];
     for (var i = 0; i < tdata.length; i++) {
         for (var key in tdata[i]) {
           if(col.indexOf(key)===-1) {
              col.push(key);
             }
            }
         }
      // CREATE DYNAMIC TABLE.
     var table = document.createElement("table");
     // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
     var tr = table.insertRow(-1);                   // TABLE ROW.
     for (var i = 0; i < col.length; i++) {
         var th = document.createElement("th");      // TABLE HEADER.
         //Make Header Pretty
         th.innerHTML = col[i].replace(/([a-z0-9])([A-Z])/g, '$1 $2');
         if(hiddenFields.includes(col[i])){
           th.style = "display:none;"
         }
         tr.appendChild(th);
     }
     // ADD  DATA TO THE TABLE AS ROWS.
     for (var i = 0; i < tdata.length; i++) {
         tr = table.insertRow(-1);
          for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            //add Class and hide fields
            if(hiddenFields.includes(col[j])){
              tabCell.style = "display:none;"
            }
            tabCell.className = col[j]
            tabCell.innerHTML = tdata[i][col[j]];
         }
     }
     //sort table by (3rd) column
     var rows, switching, i, x, y, shouldSwitch;
  
     switching = true;
     /*Make a loop that will continue until
     no switching has been done:*/
     while (switching) {
       //start by saying: no switching is done:
       switching = false;
       rows = table.getElementsByTagName("TR");
       /*Loop through all table rows (except the
       first, which contains table headers):*/
       for (i = 1; i < (rows.length - 1); i++) {
         //start by saying there should be no switching:
         shouldSwitch = false;
         /*Get the two elements you want to compare,
         one from current row and one from the next:*/
         x = rows[i].getElementsByTagName("TD")[3];
         y = rows[i + 1].getElementsByTagName("TD")[3];
         //check if the two rows should switch place:
         if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
           //if so, mark as a switch and break the loop:
           shouldSwitch = true;
           break;
         }
       }
       if (shouldSwitch) {
         /*If a switch has been marked, make the switch
         and mark that a switch has been done:*/
         rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
         switching = true;
       }
     }
     var divContainer = document.getElementById(tableTag);
     divContainer.innerHTML = "";
     divContainer.appendChild(table);
 
 } 
getUsers()
getSteps();
getLists();

});
