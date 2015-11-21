/*
https://github.com/mbostock/d3/wiki/Selections
http://stackoverflow.com/questions/24193593/d3-how-to-change-dataset-based-on-drop-down-box-selection
http://jsfiddle.net/spanndemic/5JRMt/
https://github.com/mbostock/d3/wiki/Arrays
*/

var dataset, full_dataset, shown_dataset; //var dataset é inútil (mas não apagar ainda), as outras são usadas

var year_min, year_max;

// filter by sport, handle years, do total of medals chosen, sort by total of medals chosen
function process_data(data_in){
	var return_dataset = data_in.sort(function(a, b){
		return b.numberBronze - a.numberBronze;
	});
	return return_dataset;
}

d3.csv("medals_test1.csv", function (data) {
    full_dataset = data;    
    shown_dataset = process_data(full_dataset);
	gen_bars();
	//gen_bubbles();
})


function gen_bars() {
    var w = 800;
    //var h = 400;
	var bar_thickness = 20;
    var padding=30;
	var between_bars = 10;
	var bar_stroke_thickness = 2;
	var bar_shift_right = 200;
	var medal_label_shift_right = 20;
	
    var svg = d3.select("#bar_chart")
                .append("svg")
                .attr("width",w)
                .attr("height",1000);

    var hscale = d3.scale.linear()
                         .domain([0,200])
                         .range([0,w]);

    var yscale = d3.scale.linear()
                         .domain([0,shown_dataset.length])
                         .range([0,shown_dataset.length*(bar_thickness+between_bars)]);

    var bar_w = Math.floor((w-padding*2)/shown_dataset.length)-1;

	/*
	parte em que se desenha
	*/
    var bars = svg.selectAll("g")
		.data(shown_dataset);
		
	var bars_enter = bars.enter().append("g");
       
	//make the bars
	bars_enter.append("rect").attr("height",bar_thickness)
	    .attr("width",function(d) {
                          return hscale(d.numberBronze); //medals shown
	                   })
	    .attr("fill","rgb(0,150,255)")	     
	    .attr("y",function(d, i) {
                          return bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x",bar_shift_right+ bar_stroke_thickness/2)
		.attr("stroke-width",3).attr("stroke","black")
	    .append("title")
		.text(function(d) { return d.NOC;});	//country identifier
	
	//make the medal number label
	bars_enter.append("text").text(function(d) {return d.numberBronze;})
		.attr("y",function(d, i) {
                          return bar_thickness*0.75 + bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x", function(d){
							return bar_shift_right + bar_stroke_thickness/2 + hscale(d.numberBronze) + medal_label_shift_right});
	
	//make the country name label
	bars_enter.append("text").text(function(d) {return d.country_name;})
		.attr("y",function(d, i) {
                          return bar_thickness*0.75 + bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x", 0);
		
	//exit?

	/*
	var yaxis = d3.svg.axis()
	                  .scale(hscale)
	                  .orient("left");	                  
	*/
	
	/*
	svg.append("g")	
	   .attr("transform","translate(30,0)")
	   .attr("class","axis")
	   .call(yaxis);	   
	*/
	
	/*
	var xaxis = d3.svg.axis()
	                  .scale(d3.scale.linear()
	                  	             .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
	                  	             .range([padding+bar_w/2,w-padding-bar_w/2]))
	                  .tickFormat(d3.format("f"))
	                  .ticks(dataset.length/2)
	                  .orient("bottom");
	*/
	
	/*
	d3.selectAll("#old")
	  .on("click", function() {
	  	  dataset = full_dataset.slice(35,70);
	  	  bar_w = Math.floor((w-padding*2)/dataset.length)-1;

	  	  svg.selectAll("rect")
	  	     .data(dataset)
	  	     .attr("height",function(d) {
                          return h-padding-hscale(d.rating);
	                   })
	         .attr("fill","red")
	     	 .attr("y",function(d) {
	     	              return hscale(d.rating);
	                   })
	         .select("title")
	            .text(function(d) { return d.title;});

		  xaxis.scale(d3.scale.linear()
	                   .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
	                   .range([padding+bar_w/2,w-padding-bar_w/2]));

         d3.select(".x.axis")           
	       .call(xaxis);	

	   });
	*/
}
