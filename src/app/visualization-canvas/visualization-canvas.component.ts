import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, Output, Input, EventEmitter } from '@angular/core';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';

import data from '../data/Data_Investment.json';
import { InfoVisInteractionService } from '../info-vis-interaction.service';

interface Item {
  label: string,
  value: string
}

declare let vegaEmbed: any;

@Component({
  selector: 'app-visualization-canvas',
  templateUrl: './visualization-canvas.component.html',
  styleUrls: ['./visualization-canvas.component.scss']
})
export class VisualizationCanvasComponent implements OnInit {

  @Output() receiveData = new EventEmitter<any>();

  xAxis: string[] = [];
  values: string[] = [];
  legend: string[] = [];

  checkedHighlight: { [characterName: string]: boolean } = {
    "Projects": false,
    "Amount": false,
  }


  baseWidth = 860

  csvRecords: any[] = [];
  header = false;


  //Visualization 
  chart: string = "bar";

  dataFields = ['Projects', 'Amount', 'State', 'Energy Type', 'Party of Governor', 'Investment Type', 'Year']

  dataFieldsConfig: { [characterName: string]: string } = {

    "Energy Type": "nominal",
    "State": "nominal",
    "Party of Governor": "nominal",
    "Investment Type": "nominal",
    "Year": "temporal",
    "Projects": "quantitative",
    "Amount": "quantitative",
    //"Population": "quantitative"
  }

  highlightedFields = {};

  selectedHighlightAxis = "";


  optionDictionary: { [characterName: string]: Item[] } = {
    "Party of Governor": [{ label: "Republican", value: "Republican" }, { label: "Democratic", value: "Democratic" }, { label: "Independant", value: "Independant" }],
    "State": [{ label: "Alaska", value: "Alaska" }, { label: "Illinois", value: "Illinois" }, { label: "New York", value: "New York" }, { label: "Maine", value: "Maine" }, { label: "Texas", value: "Texas" }, { label: "North Carolina", value: "North Carolina" }, { label: "Washington", value: "Washington" }, { label: "Iowa", value: "Iowa" }, { label: "New Jersey", value: "New Jersey" }, { label: "Minnesota", value: "Minnesota" }, { label: "Idaho", value: "Idaho" }, { label: "California", value: "California" }, { label: "Wyoming", value: "Wyoming" }, { label: "Pennsylvania", value: "Pennsylvania" }, { label: "Arizona", value: "Arizona" }, { label: "Florida", value: "Florida" }, { label: "Colorado", value: "Colorado" }, { label: "Hawaii", value: "Hawaii" }, { label: "Michigan", value: "Michigan" }, { label: "Vermont", value: "Vermont" }, { label: "Wisconsin", value: "Wisconsin" }, { label: "Oregon", value: "Oregon" }, { label: "Kansas", value: "Kansas" }, { label: "Kentucky", value: "Kentucky" }, { label: "Georgia", value: "Georgia" }, { label: "Massachusetts", value: "Massachusetts" }, { label: "Virginia", value: "Virginia" }, { label: "Missouri", value: "Missouri" }, { label: "Rhode Island", value: "Rhode Island" }, { label: "Alabama", value: "Alabama" }, { label: "Tennessee", value: "Tennessee" }, { label: "Mississippi", value: "Mississippi" }, { label: "Ohio", value: "Ohio" }, { label: "Indiana", value: "Indiana" }, { label: "Nebraska", value: "Nebraska" }, { label: "Oklahoma", value: "Oklahoma" }, { label: "Arkansas", value: "Arkansas" }, { label: "South Dakota", value: "South Dakota" }, { label: "North Dakota", value: "North Dakota" }, { label: "New Hampshire", value: "New Hampshire" }, { label: "Maryland", value: "Maryland" }, { label: "West Virginia", value: "West Virginia" }, { label: "Louisiana", value: "Louisiana" }, { label: "New Mexico", value: "New Mexico" }, { label: "Montana", value: "Montana" }, { label: "Utah", value: "Utah" }, { label: "South Carolina", value: "South Carolina" }, { label: "Connecticut", value: "Connecticut" }, { label: "Puerto Rico", value: "Puerto Rico" }, { label: "Nevada", value: "Nevada" }, { label: "Delaware", value: "Delaware" }],
    "Investment Type": [{ label: "Direct Loan", value: "Direct Loan" }, { label: "Grant", value: "Grant" }, { label: "Unknown", value: "Unknown" }, { label: "Payment", value: "Payment" }, { label: "Loan Guarantee", value: "Loan Guarantee" }, { label: "Combo Grant/Loan", value: "Combo Grant/Loan" }],
    "Year": [{ label: "2021", value: "2021" }, { label: "2020", value: "2020" }, { label: "2019", value: "2019" }, { label: "2018", value: "2018" }, { label: "2017", value: "2017" }],
    "Energy Type": [{ label: "Hydroelectric", value: "Hydroelectric" }, { label: "Solar", value: "Solar" }, { label: "Energy Efficiency", value: "Energy Efficiency" }, { label: "Anaerobic Digester", value: "Anaerobic Digester" }, { label: "Renewable Biomass", value: "Renewable Biomass" }, { label: "Other", value: "Other" }, { label: "Wind", value: "Wind" }, { label: "Hydrogen", value: "Hydrogen" }, { label: "Geothermal", value: "Geothermal" }]
  }

  public filterDictionary: { [characterName: string]: string[] } = { "Party of Governor": [], "State": [], "Investment Type": [], "Energy Type": [], "Year": [] };


  aggregates: Item[] = [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "Min", value: "min" }, { label: "Max", value: "max" }]
  public selectedAggregate: { [characterName: string]: string } = { "Amount": "sum", "Projects": "sum", "Population": "mean" }

  public filterNumber: { [characterName: string]: number[] } = { "Amount": [0, 4000000000], "Projects": [0, 21000]};

  public maxList = {"Amount": {"mean": 60000000, "sum": 4000000000, "min": 25000000, "max": 250000000}, "Projects": {"mean": 750, "sum": 21000, "min": 750, "max": 750}};

  public numFilterActive: { [characterName: string]: boolean[] } = {"Amount": [false, false], "Projects": [false, false]}
  vegaLiteSpecification: any;


  constructor(private ngxCsvParser: NgxCsvParser, private infoVisInteraction: InfoVisInteractionService) { }

  ngOnInit(): void {

    for (var element in this.optionDictionary) {
      this.optionDictionary[element].forEach(item => this.filterDictionary[element].push(item["value"]))
    }

    this.createVisalization()

  }

  createVisalization() {
    this.vegaLiteSpecification = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "background": "#f7f8f9",
      "width": "container",
      "height": "container",
      "transform": [
      ],
      "autosize": {
        "type": "fit",
        "contains": "padding"
      },
      "params": [
      ],
      "data": {
        "values": [],
        "format": {
          "type": "json"
        }
      },
      "encoding": {
        "x": {}, "color": {},
        "strokeWidth": {
        }
      },
      "resolve": { "scale": { "y": "independent" } }
    };

    if (this.xAxis.length > 0 || this.values.length > 0 || this.legend.length > 0) {
      this.vegaLiteSpecification.data.values = data
    }



    var opacity = {}
    var strokeOpacity = {}
    var fillOpacity = {}
    var params = []
    var tooltip: any[] = []
    var width = 0;
    var size = 0;


    this.xAxis.forEach(element => {
      if (this.dataFieldsConfig[element] == "quantitative") {
        tooltip.push({ "field": element, "type": this.dataFieldsConfig[element] })
      } else { tooltip.push({ "field": element, "type": "nominal" }) }
    })
    this.legend.forEach(element => {
      if (this.dataFieldsConfig[element] == "quantitative") {
        tooltip.push({ "field": element, "type": this.dataFieldsConfig[element] })
      } else { tooltip.push({ "field": element, "type": "nominal" }) }
    })

    /***
     * If this chart is specified as a bar Chart
     */
    if (this.chart == "bar") {

      if (this.xAxis.length >= 1) {
        this.vegaLiteSpecification.encoding.x = { "field": this.xAxis[0], "type": "ordinal", "axis": { "labelPadding": 0, "labelOverlap": "true" } }

        if (this.dataFieldsConfig[this.xAxis[0]] == "quantitative") {
          this.vegaLiteSpecification.encoding.x.type = "quantitative"
          this.vegaLiteSpecification.encoding.x.scale = {"domainMin": 0}
        }
        else if (this.filterDictionary[this.xAxis[0]].length >= 1) {
          width = this.baseWidth / this.filterDictionary[this.xAxis[0]].length
        }
      }

      if (this.legend.length >= 1) {
        this.vegaLiteSpecification.encoding.color = { "field": this.legend[0]}
      }


      if (this.values.length >= 1) {
        size = (width / this.values.length)
        this.vegaLiteSpecification.layer = []
      }
      else {
        this.vegaLiteSpecification.mark = { "type": "tick" }
      }

      for (var i = 0; i < this.values.length; i++) {
        var offSet = -(width / 2) + size / 2 + (size * i)

        if (this.legend.length >= 1) {
          opacity = {
            "condition": { "param": "legendSelect" + i, "value": 1 },
            "value": 0.2
          }

          params = [{
            "name": "legendSelect" + i,
            "select": { "type": "point", "fields": [this.legend[0]] },
            "bind": "legend"
          }]

          if (Object.keys(this.highlightedFields).length > 0) {
            params[0]["value"] = this.highlightedFields
          }
        }

        if (this.dataFieldsConfig[this.values[i]] == "quantitative") {

          fillOpacity = {
            "condition": { "test": (this.values[i] == this.selectedHighlightAxis || this.selectedHighlightAxis == "").toString(), "value": 1 },
            "value": 0.4
          }

          if (this.dataFieldsConfig[this.xAxis[0]] == "quantitative") {
            this.vegaLiteSpecification.layer.push(
              {
                "mark": {
                  "type": this.chart
                },
                "encoding": {

                  "y": { "field": this.values[i], "aggregate": this.selectedAggregate[this.values[i]], "axis": { "labelOverlap": "true" } },
                  "tooltip": tooltip.concat({ "field": this.values[i], "type": this.dataFieldsConfig[this.values[i]], "aggregate": this.selectedAggregate[this.values[i]], }),
                  "opacity": opacity,
                  "fillOpacity": fillOpacity,

                },
                "params": params
              }
            )
          }
          else {
            this.vegaLiteSpecification.layer.push(
              {
                "mark": {
                  "type": this.chart, "size": size * 0.9, "xOffset": offSet
                },
                "encoding": {

                  "y": { "field": this.values[i], "aggregate": this.selectedAggregate[this.values[i]], "axis": { "labelOverlap": "true" } },
                  "tooltip": tooltip.concat({ "field": this.values[i], "type": this.dataFieldsConfig[this.values[i]], "aggregate": this.selectedAggregate[this.values[i]], }),
                  "opacity": opacity,
                  "fillOpacity": fillOpacity,

                },
                "params": params
              }
            )
          }
        }
        else {
          this.vegaLiteSpecification.layer.push(
            {
              "mark": {
                "type": this.chart, "size": size * 0.9, "xOffset": offSet
              },
              "encoding": {

                "y": { "field": this.values[i], "axis": { "labelOverlap": "true" } },
                "tooltip": tooltip.concat({ "field": this.values[i], "type": "nominal", "aggregate": this.selectedAggregate[this.values[i]], })

              }
            }
          )
        }
      }
    }

    /***
     * If this chart is specified as a point or line Chart
     */
    else if (this.chart == "point" || this.chart == "line") {
      this.vegaLiteSpecification.encoding.strokeWidth = {
        "value": 2
      }

      if (this.xAxis.length >= 1) {
        if (this.dataFieldsConfig[this.xAxis[0]] == "quantitative") {
          this.vegaLiteSpecification.encoding.x = { "field": this.xAxis[0], "type": this.dataFieldsConfig[this.xAxis[0]], "axis": { "labelPadding": 0, "labelOverlap": "true" } }
        }
        else {
          this.vegaLiteSpecification.encoding.x = { "field": this.xAxis[0], "type": "nominal", "axis": { "labelPadding": 0, "labelOverlap": "true" } }

        }

      }
      if (this.legend.length >= 1) {
        this.vegaLiteSpecification.encoding.color = { "field": this.legend[0]}

      }

      if (this.values.length >= 1) {
        this.vegaLiteSpecification.layer = []
      }
      else {
        this.vegaLiteSpecification.mark = { "type": this.chart }
      }

      for (var i = 0; i < this.values.length; i++) {
        if (this.legend.length >= 1) {
          this.vegaLiteSpecification.encoding.color = { "field": this.legend[0] }

        }
        if (this.dataFieldsConfig[this.values[i]] == "quantitative") {

          strokeOpacity = {
            "condition": { "test": (this.values[i] == this.selectedHighlightAxis || this.selectedHighlightAxis == "").toString(), "value": 1 },
            "value": 0.4
          }

          if (this.legend.length >= 1) {
            opacity = {
              "condition": { "param": "legendSelect" + i, "value": 1 },
              "value": 0.4
            }



            params = [{
              "name": "legendSelect" + i,
              "select": { "type": "point", "fields": [this.legend[0]] },
              "bind": "legend"
            }]

            if (Object.keys(this.highlightedFields).length > 0) {
              params[0]["value"] = this.highlightedFields
            }
          }
          var mark: any = {
            "type": this.chart
          }

          if (this.chart == "line") {
            mark = {
              "type": this.chart,
              "point": {
                "filled": false,
                "fill": "white"
              }
            }
          }



          this.vegaLiteSpecification.layer.push(
            {
              "mark": mark,
              "encoding": {

                "y": { "field": this.values[i], "aggregate": this.selectedAggregate[this.values[i]], "axis": { "labelOverlap": "true" } },
                "tooltip": tooltip.concat({ "field": this.values[i], "type": this.dataFieldsConfig[this.values[i]], "aggregate": this.selectedAggregate[this.values[i]], }),
                "opacity": opacity,
                "strokeOpacity": strokeOpacity,
              },
              "params": params
            }
          )
        }
        else {
          this.vegaLiteSpecification.layer.push(
            {
              "mark": {
                "type": this.chart
              },
              "encoding": {

                "y": { "field": this.values[i], "axis": { "labelOverlap": "true" } },
                "tooltip": tooltip.concat({ "field": this.values[i], "type": "nominal", "aggregate": this.selectedAggregate[this.values[i]], })

              }
            }
          )
        }

      }

    }

    this.vegaLiteSpecification.transform = [
      { "filter": { "field": "Party of Governor", "oneOf": this.filterDictionary["Party of Governor"] } },
      { "filter": { "field": "Energy Type", "oneOf": this.filterDictionary["Energy Type"] } },
      { "filter": { "field": "State", "oneOf": this.filterDictionary["State"] } },
      { "filter": { "field": "Investment Type", "oneOf": this.filterDictionary["Investment Type"] } },
      { "filter": { "field": "Year", "oneOf": this.filterDictionary["Year"] } },
      { "filter": { "field": "Amount", "range": this.filterNumber["Amount"] } },
      { "filter": { "field": "Projects", "range": this.filterNumber["Projects"] } }
    ]

    if (this.values.length == 0 && this.xAxis.length > 0) {
      if (this.legend.length == 0) {
        this.vegaLiteSpecification.transform.push(
          {
            "pivot": "Population",
            "value": this.xAxis[0],
            "groupby": this.xAxis
          }
        )
      }
      else {
        this.vegaLiteSpecification.transform.push(
          {
            "pivot": "Population",
            "value": this.xAxis[0],
            "groupby": this.xAxis.concat(this.legend)
          }
        )
      }

    }
    else if (this.values.length == 0 && this.legend.length > 0) {
      this.vegaLiteSpecification.transform.push(
        {
          "pivot": "Population",
          "value": this.legend[0],
          "groupby": this.legend
        }
      )
    }

    console.log(this.vegaLiteSpecification)

    vegaEmbed('#vis', this.vegaLiteSpecification, { "actions": false, "mode": "vega-lite", "renderer": "svg" }).then(function (result: any) {

      var width = result.view.getState()["signals"]["width"]
      if (width != this.baseWidth && this.values.length >= 1) {
        this.baseWidth = width
        this.createVisalization()
      }

      result.view.addEventListener('click', function (event, item) {
        if (typeof (item) !== undefined && "description" in item) {
          this.infoVisInteraction.addAxisHighlight(this, item["description"].split("; ")[1].split(" ")[2].slice(0, -1),true)
          this.createVisalization();
        }
      }.bind(this));


      if (this.legend.length > 0 && this.values.length >= 1) {
        result.view.addSignalListener("legendSelect0", function (name, value) {
          if (Object.keys(value).length > 0) {
            this.infoVisInteraction.addLegendHighlight(this, value, true)
          }
          else {
            this.infoVisInteraction.removeLegendHighlight(this, ["ALL"], true)
          }
          this.createVisalization();
        }.bind(this))
      }

      // Access the Vega view instance (https://vega.github.io/vega/docs/api/view/) as result.view
    }.bind(this)).catch((error: any) => {
      console.error(error);
    });

  }

  handleChange(event: any, target: any) {
    this.infoVisInteraction.addAxisHighlight(this, this.values[target], true)
    this.createVisalization();
  }

  handleChangeStar(event: any, target: any) {
    this.infoVisInteraction.addAxisHighlight(this, target, true)
    this.createVisalization();
  }



}
