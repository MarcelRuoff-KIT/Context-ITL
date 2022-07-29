import { Injectable } from '@angular/core';

@Injectable()
export class InfoVisInteractionService {

  constructor() { }


  async processAction(that, action){
    if(action["Add"]["Visualization"].length > 0){
      await this.changeVisualization(that, action["Add"]["Visualization"][0], true)
    }

  }


  /**
 * Encodings
 */


  /**
   * Change Visualization
   */
  changeVisualization(that: any, target: string, unqiue: boolean) {
    var current = document.getElementsByClassName("p-button-raised p-button-secondary active");
    if (current.length > 0) {
      current[0].className = current[0].className.replace(" active", "");
    }
    document.getElementById(target).childNodes[0]["className"] += " active";

    that.visCanvas.chart = target;
  }


  /**
   * Change x-Axis
   */

  addXAxis(that: any, dataFields: string[], unqiue: boolean) {

    //remove previous xAxis
    this.removeXAxis(that, that.visCanvas.xAxis, false)

    dataFields.forEach((dataField: string) => {
      if (that.visCanvas.xAxis.includes(dataField)) {
        this.removeXAxis(that, [dataField], false)
      }
      else if (that.visCanvas.values.includes(dataField)) {
        this.removeValues(that, [dataField], false)
        document.getElementById("valueConstraint").innerText = "Values (" + that.visCanvas.values.length + "/2)"

      }
      else if (that.visCanvas.legend.includes(dataField)) {
        this.removeLegends(that, [dataField], false)
        document.getElementById("legendConstraint").innerText = "Color (" + that.visCanvas.legend.length + "/1)"

      }
    })

    if (dataFields.length > 0) {
      that.visCanvas.xAxis = [dataFields[0]]

      that.selectedDataFields.push(dataFields[0])
      that.selectedDataFields = JSON.parse(JSON.stringify(that.selectedDataFields))
    }
    document.getElementById("xAxisConstraint").innerText = "x-Axis (" + that.visCanvas.xAxis.length + "/1)"


  }

  removeXAxis(that: any, dataFields: string[], unqiue: boolean) {
    var mediateFields = JSON.parse(JSON.stringify(that.visCanvas.xAxis))
    that.visCanvas.xAxis = mediateFields.filter((datafield: any) => !dataFields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(that.selectedDataFields))
    that.selectedDataFields = mediateAllFields.filter((datafield: any) => !dataFields.includes(datafield))

    document.getElementById("xAxisConstraint").innerText = "x-Axis (" + that.visCanvas.xAxis.length + "/1)"

  }

  /**
   * Change Values
   */

  addValues(that: any, dataFields: string[], unqiue: boolean) {
    var nonNumeric = false
    dataFields.forEach((dataField: string) => {
      if (that.visCanvas.dataFieldsConfig[dataField] == "quantitative") {
        if (that.visCanvas.xAxis.includes(dataField)) {
          this.removeXAxis(that, [dataField], false)
          document.getElementById("xAxisConstraint").innerText = "x-Axis (" + that.visCanvas.xAxis.length + "/1)"

        }
        else if (that.visCanvas.values.includes(dataField)) {
          this.removeValues(that, [dataField], false)
        }
        else if (that.visCanvas.legend.includes(dataField)) {
          this.removeLegends(that, [dataField], false)
          document.getElementById("legendConstraint").innerText = "Color (" + that.visCanvas.legend.length + "/1)"

        }
      }
    })

    for (var i = 0; i < dataFields.length; i++) {
      if (that.visCanvas.dataFieldsConfig[dataFields[i]] == "quantitative") {
        if (that.visCanvas.values.length >= 2) {
          this.removeValues(that, [that.visCanvas.values[0]], false)
        }

        that.visCanvas.values.push(dataFields[i])
        that.visCanvas.values = JSON.parse(JSON.stringify(that.visCanvas.values))
        that.selectedDataFields.push(dataFields[i])
        that.selectedDataFields = JSON.parse(JSON.stringify(that.selectedDataFields))
      }
      else {
        nonNumeric = true
      }
    }

    if (nonNumeric) {
      that.showErrorMessage()
    }

    document.getElementById("valueConstraint").innerText = "Values (" + that.visCanvas.values.length + "/2)"

  }

  removeValues(that: any, dataFields: string[], unqiue: boolean) {
    var mediateFields = JSON.parse(JSON.stringify(that.visCanvas.values))
    that.visCanvas.values = mediateFields.filter((datafield: any) => !dataFields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(that.selectedDataFields))
    that.selectedDataFields = mediateAllFields.filter((datafield: any) => !dataFields.includes(datafield))

    that.visCanvas.selectedHighlightAxis = ""

    document.getElementById("valueConstraint").innerText = "Values (" + that.visCanvas.values.length + "/2)"

  }

  /**
   * Change Legend
   */

  addLegends(that: any, dataFields: string[], unqiue: boolean) {

    this.removeXAxis(that, that.visCanvas.legend, false)

    dataFields.forEach((dataField: string) => {
      if (that.visCanvas.xAxis.includes(dataField)) {
        this.removeXAxis(that, [dataField], false)
        document.getElementById("xAxisConstraint").innerText = "x-Axis (" + that.visCanvas.xAxis.length + "/1)"

      }
      else if (that.visCanvas.values.includes(dataField)) {
        this.removeValues(that, [dataField], false)
        document.getElementById("valueConstraint").innerText = "Values (" + that.visCanvas.values.length + "/2)"

      }
      else if (that.visCanvas.legend.includes(dataField)) {
        this.removeLegends(that, [dataField], false)
      }
    })


    if (dataFields.length > 0) {
      that.visCanvas.legend = [dataFields[0]]

      that.selectedDataFields.push(dataFields[0])
      that.selectedDataFields = JSON.parse(JSON.stringify(that.selectedDataFields))

      that.highlightedFields = { [that.visCanvas.legend[0]]: that.visCanvas.filterDictionary[that.visCanvas.legend[0]] }
    }

    document.getElementById("legendConstraint").innerText = "Color (" + that.visCanvas.legend.length + "/1)"

  }

  removeLegends(that: any, dataFields: string[], unqiue: boolean) {
    var mediateFields = JSON.parse(JSON.stringify(that.visCanvas.legend))
    that.visCanvas.legend = mediateFields.filter((datafield: any) => !dataFields.includes(datafield))

    var mediateAllFields = JSON.parse(JSON.stringify(that.selectedDataFields))
    that.selectedDataFields = mediateAllFields.filter((datafield: any) => !dataFields.includes(datafield))

    that.visCanvas.highlightedFields = {}

    document.getElementById("legendConstraint").innerText = "Color (" + that.visCanvas.legend.length + "/1)"

  }




  /**
   * Change Filter
   */

  removeFilters(that: any, dataFields: string[], unqiue: boolean) {
    dataFields.forEach(element => {
      if (document.getElementById("Filter-" + element)!["className"] != "col-12 closed") {
        document.getElementById("Filter-" + element)!["className"] += " closed";
      }
      if (that.visCanvas.dataFieldsConfig[element] == "quantitative") {
        that.visCanvas.filterNumber[element][1] = that.visCanvas.maxList[element][that.visCanvas.selectedAggregate[element]]
      }
      else {
        that.visCanvas.filterDictionary[element] = []
        that.visCanvas.optionDictionary[element].forEach((item: { [x: string]: any; }) => that.visCanvas.filterDictionary[element].push(item["value"]))
      }
    })
  }

  openingFilters(that: any, dataFields: string[], unqiue: boolean) {
    dataFields.forEach(element => {
      document.getElementById("AddingFilters")!.parentNode!.insertBefore(document.getElementById("Filter-" + element)!, document.getElementById("AddingFilters")!.nextSibling)
      document.getElementById("Filter-" + element)!["className"] = "col-12";
    })
  }

  changeNumFilter(that: any, filters: any[], unqiue: boolean) {
    filters.forEach(element => {
      var target = Object.keys(element)[0]
      var range = element[target]

      if (range[0] == "lower") {
        range[0] = 0
      }
      if (range[1] == "upper") {
        range[1] = that.visCanvas.maxList[target][that.visCanvas.selectedAggregate[target]]
      }
      that.visCanvas.filterNumber[target] = range
    })
  }

  addCatFilter(that: any, filters: any[], unqiue: boolean) {
    filters.forEach(element => {
      var target = Object.keys(element)[0]
      if (element[target].includes("ALL")) {
        that.visCanvas.optionDictionary[target].forEach(item => that.visCanvas.filterDictionary[target].push(item["value"]))
      }
      else {
        that.visCanvas.filterDictionary[target] = that.visCanvas.filterDictionary[target].concat(element[target])
      }
    })
  }


  removeCatFilter(that: any, filters: any[], unqiue: boolean) {
    filters.forEach(element => {
      var target = Object.keys(element)[0]
      if (element[target].includes("ALL")) {
        that.visCanvas.filterDictionary[target] = []
      }
      else {
        that.visCanvas.filterDictionary[target] = that.visCanvas.filterDictionary[target].filter(item => !element[target].includes(item))
      }
    })
  }



  /**
   * Change Aggregate
   */

  changeAggregate(that: any, dataField: string, aggregate: string, unqiue: boolean) {
    that.visCanvas.selectedAggregate[dataField] = aggregate


    for (var i = 0; i < Object.keys(that.visCanvas.maxList[dataField]).length; i++) {
      if (that.visCanvas.maxList[dataField][Object.keys(that.visCanvas.maxList[dataField])[i]] == that.visCanvas.filterNumber[dataField][1]) {
        that.visCanvas.filterNumber[dataField][1] = that.visCanvas.maxList[dataField][aggregate]
        break;
      }
    }
  }



  /**
   * ChangeActiveFilter
   */

  changeActiveFilter(that: any, dataField: string, boundary: any, value: boolean, unqiue: boolean) {

    if (value) {
      document.getElementById(boundary + "-" + dataField)!["style"]["display"] = "inline-flex";
    }
    else {
      document.getElementById(boundary + "-" + dataField)!["style"]["display"] = "none";
      if (boundary == 0) {
        that.visCanvas.filterNumber[dataField][boundary] = 0
      }
      else {
        that.visCanvas.filterNumber[dataField][boundary] = that.visCanvas.maxList[dataField][that.visCanvas.selectedAggregate[dataField]]
      }

    }


  }

  /**
   * changeAxisHighlight
   */

  addAxisHighlight(that: any, target: any, unqiue: boolean) {

    Object.keys(that.checkedHighlight).forEach(element => {
      that.checkedHighlight[element] = false
    })


    document.getElementById("Axis-0").style.backgroundColor = ""
    document.getElementById("Axis-1").style.backgroundColor = ""

    if (that.selectedHighlightAxis == target) {
      that.selectedHighlightAxis = ""
    }
    else {
      that.selectedHighlightAxis = target
      that.checkedHighlight[target] = true

      if (that.values.indexOf(target) == 0) {
        document.getElementById("Axis-1").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
      else {
        document.getElementById("Axis-0").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
    }
  }

  removeAxisHighlight(that: any, target: any, unqiue: boolean) {

    Object.keys(that.checkedHighlight).forEach(element => {
      that.checkedHighlight[element] = false
    })

    document.getElementById("Axis-0").style.backgroundColor = ""
    document.getElementById("Axis-1").style.backgroundColor = ""

    if (that.selectedHighlightAxis == target) {
      that.selectedHighlightAxis = ""
    }
    else {
      if (that.values.indexOf(target) == 0) {
        that.selectedHighlightAxis = that.values[1]
        that.checkedHighlight[that.values[1]] = true
        document.getElementById("Axis-0").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
      else {
        that.selectedHighlightAxis = that.values[0]
        that.checkedHighlight[that.values[0]] = true
        document.getElementById("Axis-1").style.backgroundColor = "rgba(255, 255, 255, .6)"

      }
    }
  }

  addLegendHighlight(that: any, values: string[], unqiue: boolean) {

    if (values.includes("ALL")) {
      var valuesFiltered = []
      that.optionDictionary[that.legend[0]].forEach(item => {
        valuesFiltered.push(item["value"])
      })
      that.highlightedFields = { [that.legend[0]]: valuesFiltered }
    }
    else {
      var valueFiltered = values.filter(item => {
        return that.optionDictionary[that.legend[0]].some(element => element["value"] == item)
      })



      if (Object.keys(that.highlightedFields).includes(that.legend[0]) && valueFiltered.length > 0) {
        that.highlightedFields[that.legend[0]] = that.highlightedFields[that.legend[0]].concat(valueFiltered)
      }

      if (valueFiltered.length > 0) {
        that.highlightedFields = { [that.legend[0]]: valueFiltered }
      }
    }

  }

  removeLegendHighlight(that: any, values: string[], unqiue: boolean) {
    if (values.includes("ALL")) {
      that.highlightedFields = {}
    }
    else if (Object.keys(that.highlightedFields).includes(that.legend[0])) {
      that.highlightedFields[that.legend[0]] = that.highlightedFields[that.legend[0]].filter(item => !values.includes(item))
    }
    else {
      var valuesFiltered = []
      that.optionDictionary[that.legend[0]].forEach(item => {
        if (!values.includes(item["value"])) {
          valuesFiltered.push(item["value"])
        }
      })
      that.highlightedFields = { [that.legend[0]]: valuesFiltered }
    }
  }


}







