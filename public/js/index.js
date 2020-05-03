$( document ).ready(function() {
    console.log( "ready!" );

    $('#daterange').daterangepicker({
      autoUpdateInput: false,
      locale: {
          cancelLabel: 'Clear'
      }
	  });

	  $('#daterange').on('apply.daterangepicker', function(ev, picker) {
	      $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
	  });

	  $('#daterange').on('cancel.daterangepicker', function(ev, picker) {
	      $(this).val('');
	  });

	  //clicking icon also opens date picker
	  $('.input-group-append').click(function(event){
		    event.preventDefault();
		    $('#daterange').click();
	  });

	  //OnClick - request the detail report
	  //append a form; submit it; then remove it
	  function functionDlFile(_url, _method, _data){
        //this is stubbed to pull the ajax call and make it reusable
	  }

	  $('#getReport').click((event) => {
	  	event.stopPropagation(); // Do not propagate the event.
	  	var _startDate = $('#daterange').data('daterangepicker').startDate._i;
	  	var _endDate = $('#daterange').data('daterangepicker').endDate._i;
	  	
        //functionDlFile('/rptGen','post',$('#daterange'));
        $.ajax({
          url: "/rptGen",
          type: "POST",
          data: {startDate: _startDate, endDate: _endDate},
             //xhrFields is what did the trick to read the blob to pdf
          xhrFields: {
            responseType: 'blob'
          },
          success: function (response, status, xhr) {

                var filename = "report.pdf";                   
                var disposition = xhr.getResponseHeader('Content-Disposition');

                 if (disposition) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches !== null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                } 
                var linkelem = document.createElement('a');
                try {
                        var blob = new Blob([response], { type: 'application/octet-stream' });                        

                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        //   IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        var URL = window.URL || window.webkitURL;
                        var downloadUrl = URL.createObjectURL(blob);

                        if (filename) { 
                            // use HTML5 a[download] attribute to specify filename
                            var a = document.createElement("a");

                            // safari doesn't support this yet
                            if (typeof a.download === 'undefined') {
                                window.location = downloadUrl;
                            } else {
                                a.href = downloadUrl;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.target = "_blank";
                                a.click();
                            }
                        } else {
                            window.location = downloadUrl;
                        }
                    }   

                } catch (ex) {
                    console.log(ex);
                } 
            }
        });

	  });
	  
});