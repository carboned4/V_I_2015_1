/*
https://github.com/mbostock/d3/wiki/Selections
http://stackoverflow.com/questions/24193593/d3-how-to-change-dataset-based-on-drop-down-box-selection
http://jsfiddle.net/spanndemic/5JRMt/
https://github.com/mbostock/d3/wiki/Arrays
mercator:
https://gist.github.com/patricksurry/6621971
https://github.com/mbostock/d3/blob/master/src/geo/mercator.js
http://stackoverflow.com/questions/20020895/insert-background-image-as-a-d3js-object
http://stackoverflow.com/questions/11566935/how-to-access-data-of-a-d3-svg-element
http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
http://www.d3noob.org/2013/03/a-simple-d3js-map-explained.html
https://groups.google.com/forum/#!topic/d3-js/pvovPbU5tmo
*/

var dataset, full_dataset, shown_dataset; //var dataset é inútil (mas não apagar ainda), as outras são usadas

var year = 1960;

var searchedCountry = "";

var mapdrawn = false;

var merc;
var projection;
var doit;

function startAnim(){
	doit= setInterval(animate, 1000);
}

function stopAnim(){
	clearInterval(doit);
}

function animate(){
	if(year==2008){
		clearInterval(doit);
		return;
	}
	var yearel = document.getElementById("singleyearslider");
	yearel.value = parseInt(yearel.value) + 1;
	changeYear();
}

function updateYearLabel(){
	var yearel = document.getElementById("singleyearslider");
	document.getElementById("yearelementtowrite").innerHTML = 1960+yearel.value*4;
}


function changeYear(){
	var yearel = document.getElementById("singleyearslider");
	year = 1960+yearel.value*4;
	document.getElementById("yearelementtowrite").innerHTML	=year;
	shown_dataset = process_data(full_dataset);
	gen_bars();
	gen_bubbles();
}


function startupscript(){
	document.getElementById("singleyearslider").value=0;
	changeYear();
}
	
// filter by sport, handle years, do total of medals chosen, sort by total of medals chosen
function process_data(data_in){
	var unfiltered_data = data_in.filter(function(a){
		return a["y"+year] != 0;
	});
	var return_dataset = unfiltered_data.sort(function(a, b){
		return b["y"+year] - a["y"+year];
	});
	return return_dataset;
}

d3.csv("coef.csv", function (data) {
    full_dataset = data;
	startupscript();   
	
	
	//gen_map();
})


function gen_bars() {
    var w = 600;
    //var h = 400;
	var bar_thickness = 20;
    var padding=30;
	var between_bars = 10;
	var bar_stroke_thickness = 2;
	var bar_shift_right = 200;
	var medal_label_shift_right = 20;


		d3.select("#bar_chart").selectAll("svg").remove();
    var svg = d3.select("#bar_chart")
                .append("svg")
                .attr("width",w)
                .attr("height",shown_dataset.length*(between_bars+bar_thickness));
	
	
	
    var hscale = d3.scale.sqrt()
                        .domain([
						d3.min(shown_dataset,function(d){
							return parseFloat(d["y"+year]);})
						,
						d3.max(shown_dataset,function(d){
							return parseFloat(d["y"+year]);})
						])
                        .range([0,w - bar_shift_right - medal_label_shift_right - 100]);

    var yscale = d3.scale.linear()
                         .domain([0,shown_dataset.length])
                         .range([0,shown_dataset.length*(bar_thickness+between_bars)]);

    

	
	
	/*
	parte em que se desenha as bubbles
	*/
	
    var bars = svg.selectAll("g")
		.data(shown_dataset);
		
	var bars_enter = bars.enter().append("g");
       
	//make the bars
	bars_enter.append("rect").attr("height",bar_thickness)
	    .attr("width",function(d) {
						if(!d["y"+year]) return 0.5; //for a short bar
						return hscale(d["y"+year]); //medals shown
	                   })
	    .attr("fill",function(d) { if (d.country_name==searchedCountry)
										return "red";
										return "rgb(0,150,255)";})		     
	    .on("click", colorbubbles)
		.attr("y",function(d, i) {
                          return bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x",bar_shift_right+ bar_stroke_thickness/2)
		.attr("stroke-width",3).attr("stroke","black")
		.attr("id",function(d) { return "bar_"+d.ioc_code;})
	    .append("title")
		.text(function(d) { return d.ioc_code;});	//country identifier
		
	//make the medal number label
	bars_enter.append("text").text(function(d) {if (!d["y"+year]) return 0; return d["y"+year];})
		.attr("y",function(d, i) {
                          return bar_thickness*0.75 + bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x", function(d){
							return bar_shift_right + bar_stroke_thickness/2 + hscale(d["y"+year]) + medal_label_shift_right});
	
	//make the country name label
	bars_enter.append("text").text(function(d) {return d.country_name;})
		.attr("y",function(d, i) {
                          return bar_thickness*0.75 + bar_stroke_thickness/2 +yscale(i);
	                   })
	    .attr("x", 0)
		.append("title")
		.text(function(d) { return d.ioc_code;});	//country identifier
		
	//exit?

	
}

var bubblesvg;
var path;
var projection;
var zoom_multiplier = 1;
var g;
function gen_bubbles() {
	//zoom_multiplier=1;
	var w = 600;
    var h = 300;
	var bar_thickness = 20;
    var padding=30;
	var between_bars = 10;
	var bar_stroke_thickness = 1;
	var bar_shift_right = 200;
	var medal_label_shift_right = 20;
	var max_radius = 10;
	var min_amount_for_label = 10;
	var radius_for_zero =  0.0005; // lowest value is 0.000821
	
	

	d3.selectAll(".bubble").remove();
	if(!mapdrawn){
			bubblesvg = d3.select("#bubble_map")
			.append("svg")
			.attr("width",w)
			.attr("height",h);
	}
	
    var radiusscale = d3.scale.log()
						.domain([
							d3.min(shown_dataset,function(d){
							return parseFloat(d["y"+year]);})
							,
							d3.max(shown_dataset,function(d){
							return parseFloat(d["y"+year]);})
							])
                         .range([0,max_radius]);
	
    var yscale = d3.scale.linear()
                         .domain([-90,90])
                         .range([h,0]);
	
	var xscale = d3.scale.linear()
                         .domain([-180,180])
                         .range([0,w]);
	
	projection = d3.geo.mercator()
				.center([0,0])
				.translate([280,180])
				.scale(100);
	path = d3.geo.path()
				.projection(projection);
	
	if(!mapdrawn){
		g = bubblesvg.append("g");
	// load and display the World
		d3.json("topojson.v0.min.json", function(error, topology) {
		g.selectAll("path")
		  .data(topojson.object(topology, topology.objects.countries)
			  .geometries)
		.enter()
		  .append("path")
		  .attr("d", path)
		});
		mapdrawn = true;
	}
	
	/*
	parte em que se desenha
	*/
	var bubbles = bubblesvg.selectAll("g.hack") //remove the first g element (map)
		.data(shown_dataset);
		
	var bubbles_enter = bubbles.enter().append("g");
       
	var transformFromMap = g.attr("transform");
	//make the bubbles
	bubbles_enter.attr("class", "bubble")
		.append("circle")
		.attr("r",function(d) {
                          if(!d["y"+year]) return 0;//radiusscale(radius_for_zero);
						  return radiusscale(d["y"+year])/zoom_multiplier; //medals shown
	                   })
	    .attr("fill",function(d) { if (d.country_name==searchedCountry)
										return "red";
										return "rgb(0,150,255)";})	     
	    .on("click", colorbars)
		.attr("cy",function(d) {
                          return projection([d.longitude,d.latitude])[1];
	                   })
	    .attr("cx",function(d) {
                          return projection([d.longitude, d.latitude])[0];
	                   })
		.attr("stroke-width",3/zoom_multiplier).attr("stroke","black")
		.attr("id",function(d) { return "bubble_"+d.ioc_code;})
	    .append("title")
		.text(function(d)
			{   if(!d["y"+year]) return d.ioc_code + " - 0 million medals/person\n"+d.country_name;
				return d.ioc_code + " - " + d["y"+year] + " million medals/person\n"+d.country_name;}
		);
	
	//fixes zooming in, changing year, then zooming/dragging
	bubbles_enter.attr("transform", transformFromMap)
	.attr("d", path.projection(projection));
	
		
	bubbles.exit().remove();
	
	var zoom = d3.behavior.zoom()
    .on("zoom",function() {
		var toApply = (zoom_multiplier == d3.event.scale ? 1 : d3.event.scale/zoom_multiplier); 
		zoom_multiplier = d3.event.scale;
		g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("circle")
            .attr("d", path.projection(projection));
        g.selectAll("path")  
            .attr("d", path.projection(projection));
		bubbles_enter.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		bubbles_enter.selectAll("circle")
            .attr("d", path.projection(projection))
			.attr("r", function(){
				return d3.select(this).attr("r")/toApply;
			})
			.attr("stroke-width", function(){
				return d3.select(this).attr("stroke-width")/toApply;
			});
		bubbles_enter.selectAll("text")
            .attr("d", path.projection(projection))
			.style("font-size", function(){
				return parseFloat(d3.select(this).style("font-size"))/toApply;
			})
	});
	
	
	d3.select("#country").on("change", colorbarandbubbles);
	bubblesvg.call(zoom);
	
}

function getNOCforName(nametofind){
	for(el in shown_dataset){
		var possiblecountry = shown_dataset[el];
		if(possiblecountry.country_name == nametofind){
			return possiblecountry.ioc_code;
		}
	}
	return null;
}

function getNameforNOC(ioctofind){
	for(el in shown_dataset){
		var possiblecountry = shown_dataset[el];
		if(possiblecountry.ioc_code == ioctofind){
			return possiblecountry.country_name;
		}
	}
	return null;
}

function IdToId(barid){
	return barid.split("_")[1];
}

var previousCountry = "";
function colorbars(){
	d3.select("#bar_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	d3.select("#bubble_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	
	var bartohighlight = d3.select(this).attr("id");
	var bartohighlightID = IdToId(bartohighlight);
	previousCountry = getNameforNOC(bartohighlightID);
	d3.select("#bar_"+bartohighlightID).attr("fill","red");
	d3.select("#bubble_"+bartohighlightID).attr("fill","red");
	return;
}

function colorbubbles(){
	d3.select("#bar_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	d3.select("#bubble_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	
	var bubbletohighlight = d3.select(this).attr("id");
	var bubbletohighlightID = IdToId(bubbletohighlight);
	previousCountry = getNameforNOC(bubbletohighlightID);
	d3.select("#bar_"+bubbletohighlightID).attr("fill","red");
	d3.select("#bubble_"+bubbletohighlightID).attr("fill","red");
	return;
}

function colorbarandbubbles(){
	d3.select("#bar_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	d3.select("#bubble_"+getNOCforName(previousCountry)).attr("fill","rgb(0,150,255)");
	searchedCountry = document.getElementById("country").value;
	previousCountry = searchedCountry;
	
	d3.select("#bar_"+getNOCforName(searchedCountry)).attr("fill","red");
	d3.select("#bubble_"+getNOCforName(searchedCountry)).attr("fill","red");

		
	return;
} 