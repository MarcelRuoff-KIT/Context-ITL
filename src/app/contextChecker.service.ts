import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


interface RDF {
  head: any,
  property: any,
  tail: any
}

@Injectable()
export class ContextCheckerService {

  public finalActions = {}

  public restAPI = "https://interactive-analytics.org:3006"

  public currentChecks: boolean[] = []
  public currentConstraintText: any[] = []
  public currentConstraints = []
  public constraints = []
  public constraintText: any[] = []
  public suggestions = []


  public numberOfAmbiguities = 1
  public ambiguitiesStart = []
  public ambiguitiesEnd = []
  public ambiguousConditions = []
  public ambiguityIndex = 0
  public ambiguityPrevious = false
  public ambiguityNext = false
  public ambiguityStartIndex = 0
  public ambiguityStartPrevious = false
  public ambiguityStartNext = false

  public suggestionsIndex = 0
  public suggestionsPrevious = false
  public suggestionsNext = false
  public typeOfSuggestions = ["Status", "Type", "StatusSub", "Limits", "Aggregate", "Highlight"]
  public currentTarget = ""

  public target = ["Datafields", "x-Axis", "Values", "Color", "VISUALIZATION"]




  constructor(public http: HttpClient) { }

  deriveSuggestions(that) {

    this.http.post<any>(this.restAPI + '/difference', { selectedAmbiguity: that.training.selectedAmbiguity, possibleActions: that.training.possibleActions, initialState: that.training.initialVisualizationState, finalState: that.visCanvas.currentVisualizationState }).subscribe({
      next: data => {
        console.log(data);
        this.suggestions = data["Suggestions"]
      },
      error: error => {
        console.log(error.message);
        console.error('There was an error!', error);
      }
    })


    this.suggestionsIndex = 0
    this.suggestionsPrevious = false
    if (this.suggestions.length > 1) {
      this.suggestionsNext = true
    }
  }

  async getNumberOfAmbiguities(that) {
    var number = 0
    return number

  }

  async getAmbiguousActionsStart(that, mode, open) {
    that.displaySuggestionHelp = false

    var nlInput = ""
    for (var i = 0; i < that.training.nlInput.length; i++) {
      nlInput += that.training.nlInput[i]["Text"] + " "
    }

    this.ambiguityStartPrevious = false
    this.ambiguityStartNext = false
    if (mode == "during") {
      that.displayAmbiguityDialogStart = open
    }

    this.ambiguityStartIndex = 0

    await this.http.post<any>(this.restAPI + '/ambiguitiesStart', { command: nlInput, Constraints: this.constraints, currentConfiguration: that.training.initialVisualizationState, finalActions: this.finalActions }).subscribe({
      next: data => {

        this.ambiguitiesStart = data["Ambiguities"]
        this.ambiguousConditions = []
        var ambiguousConditionsLocal = []

        for (var i = 0; i < this.ambiguitiesStart.length; i++) {
          for (var j = 0; j < this.ambiguitiesStart[i]["Constraints"].length; j++) {
            var dublicate = false
            var condition = this.ambiguitiesStart[i]["Constraints"][j]
            for (var l = 0; l < ambiguousConditionsLocal.length; l++) {
              if (JSON.stringify(ambiguousConditionsLocal[l]["Condition"]) == JSON.stringify(condition)) {
                dublicate = true
                ambiguousConditionsLocal[l]["Amount"] += 1
                break
              }
            }
            if (!dublicate) {
              ambiguousConditionsLocal.push({ "Condition": condition, "Amount": 1 })
            }
          }
        }

        for (var i = 0; i < ambiguousConditionsLocal.length; i++) {
          this.currentConstraints = []
          this.currentConstraintText = [];
          var target = ""



          var condition = ambiguousConditionsLocal[i]["Condition"]
          if (condition["property"].split("_").includes("isRange")) {
            target = condition["head"]
            this.deriveInterpretations(that, condition["head"], that.visCanvas.currentVisualizationState, false)
          }
          else if (condition["property"].split("_").includes("contains")) {
            if (that.visCanvas.dataFields.includes(condition["head"])) {
              target = "Filter_" + condition["head"] + "_Elements_" + condition["tail"]
              this.deriveInterpretations(that, "Filter_" + condition["head"] + "_Elements_" + condition["tail"], that.visCanvas.currentVisualizationState, false)
            }
            else {
              target = condition["head"] + "_" + condition["tail"]
              this.deriveInterpretations(that, condition["head"] + "_" + condition["tail"], that.visCanvas.currentVisualizationState, false)
            }
          }
          else if (condition["property"].split("_").includes("isType")) {
            if (that.visCanvas.dataFields.includes(condition["head"])) {
              target = "Datafields_" + condition["head"]
              this.deriveInterpretations(that, "Datafields_" + condition["head"], that.visCanvas.currentVisualizationState, false)
            }
            else {
              target = condition["head"]
              this.deriveInterpretations(that, condition["head"], that.visCanvas.currentVisualizationState, false)
            }
          }
          else if (condition["property"].split("_").includes("equals")) {
            var head = condition["head"].split("$")
            if (head.length > 1 && head[0] == "Aggregate") {
              target = "Values_" + head[1] + "_" + head[0]
              this.deriveInterpretations(that, "Values_" + head[1] + "_" + head[0], that.visCanvas.currentVisualizationState, false)
            }
            else if (head.length > 1) {
              if (head[1] == "FilterC") {
                target = "Filter_" + head[0]
                this.deriveInterpretations(that, "Filter_" + condition["head"], that.visCanvas.currentVisualizationState, false)
              }
              else if (head[1] == "ColorHighlight") {
                target = "ColorHighlight"
                this.deriveInterpretations(that, "ColorHighlight", that.visCanvas.currentVisualizationState, false)
              }
              target = "Values_" + head[1] + "_" + head[0]
              this.deriveInterpretations(that, "Values_" + head[1] + "_" + head[0], that.visCanvas.currentVisualizationState, false)
            }
            else {
              if (head[0] == "VISUALIZATION") {
                target = head[0] + "_" + condition["tail"]
                this.deriveInterpretations(that, head[0] + "_" + condition["tail"], that.visCanvas.currentVisualizationState, false)

              }
              else {
                target = "Values_" + condition["tail"] + "_" + condition["head"]
                this.deriveInterpretations(that, "Values_" + condition["tail"] + "_" + condition["head"], that.visCanvas.currentVisualizationState, false)
              }
            }
          }
          for (var j = this.currentConstraints.length - 1; j >= 0; j--) {
            if (this.currentConstraints[j][0]["head"] != condition["head"]) {
              this.currentConstraints.splice(j, 1)
              this.currentConstraintText.splice(j, 1)
            }
          }
          this.ambiguousConditions.push({ "Condition": JSON.parse(JSON.stringify(this.currentConstraints)), "ConditionText": JSON.parse(JSON.stringify(this.currentConstraintText)), "Amount": ambiguousConditionsLocal[i]["Amount"], "Target": target })
        }

        if (this.ambiguousConditions.length > 1 && open) {
          this.ambiguityStartNext = true
        }
        if (this.ambiguousConditions.length >= 1 && open) {
          this.currentChecks = []
          for (var i = 0; i < this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].length; i++) {
            if (this.constraintText.includes(this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"][i]["Text"])) {
              this.currentChecks.push(true)
            }
            else {
              this.currentChecks.push(false)
            }

          }
          that.putTargetElement(this.ambiguousConditions[this.ambiguityStartIndex]["Target"])

          if (that.line == null) {
            that.showConnection()
          }
          else {
            that.removeConnection()
            that.showConnection()
          }
        }
        if (mode == "start") {
          that.displayDialog = false
          if (this.ambiguousConditions.length > 0) {
            that.displayAmbiguityDialogStart = open
          }
          else {
            that.showSuggestions('current')
          }
        }


      },
      error: error => {
        console.log(error.message);
        console.error('There was an error!', error);
      }
    })
  }

  getAmbiguousActionsEnd(that, open) {
    that.displaySuggestionHelp = false

    this.ambiguityIndex = 0
    this.ambiguityPrevious = false
    this.ambiguityNext = false

    var nlInput = ""
    for (var i = 0; i < that.training.nlInput.length; i++) {
      nlInput += that.training.nlInput[i]["Text"] + " "
    }

    this.http.post<any>(this.restAPI + '/ambiguitiesEnd', { command: nlInput, Constraints: this.constraints, currentConfiguration: that.training.initialVisualizationState, finalActions: this.finalActions }).subscribe({
      next: data => {
        that.displayAmbiguityDialogEnd = open

        var ambiguities = data["Ambiguities"]

        if (this.ambiguitiesEnd.length > 0) {
          for (var i = 0; i < ambiguities.length; i++) {
            for (var j: any = 0; j < this.ambiguitiesEnd.length; j++) {
              if (JSON.stringify(ambiguities[i]["Function"]) == JSON.stringify(this.ambiguitiesEnd[j]["Function"])) {
                for (var k = 0; k < this.ambiguitiesEnd[j]['FocusConstraints'].length; k++) {
                  for (var l = 0; l < ambiguities[i]["Constraints"].length; l++) {
                    if (JSON.stringify(this.ambiguitiesEnd[j]["Constraints"][this.ambiguitiesEnd[j]["FocusConstraints"][k]]) == JSON.stringify(ambiguities[i]["Constraints"][l])) {
                      ambiguities[i]["FocusConstraints"].push(l)
                    }
                  }
                }
              }
            }
          }

        }
        this.ambiguitiesEnd = ambiguities

        if (this.ambiguitiesEnd.length > 1) {
          this.ambiguityNext = true
        }


        for (var i = 0; i < this.ambiguitiesEnd.length; i++) {
          for (var j = this.ambiguitiesEnd[i]["Text"].length; j < this.ambiguitiesEnd[i]["Constraints"].length; j++) {
            for (var k = 0; k < this.constraints.length; k++) {
              if (JSON.stringify(this.ambiguitiesEnd[i]["Constraints"][j]) == JSON.stringify(this.constraints[k][0])) {
                this.ambiguitiesEnd[i]["Text"].push(this.constraintText[k])
              }
            }
          }


        }


      },
      error: error => {
        console.log(error.message);
        console.error('There was an error!', error);
      }
    })
  }

  getAmbiguousNumber(that) {

    var nlInput = ""
    for (var i = 0; i < that.training.nlInput.length; i++) {
      nlInput += that.training.nlInput[i]["Text"] + " "
    }

    this.http.post<any>(this.restAPI + '/ambiguitiesNumber', { command: nlInput, Constraints: this.constraints, currentConfiguration: that.training.initialVisualizationState, finalActions: this.finalActions, ambiguitiesEnd: this.ambiguitiesEnd }).subscribe({
      next: data => {
        this.numberOfAmbiguities = data['Ambiguities']
      },
      error: error => {
        console.log("noting")
      }
    })

  }

  showAmbiguousNLG(that) {
    that.nlg.initializeUnderstandingDisplay(that, this.finalActions["Action"], "new")
    if (this.ambiguitiesEnd.length > 0) {
      that.nlg.initializeUnderstandingDisplay(that, this.ambiguitiesEnd[this.ambiguityIndex]["Function"], "existing")
    }
  }

  async getPossibleInterpretations(that, target) {
    that.displaySuggestionDialog = true
    this.currentConstraints = []
    this.currentConstraintText = [];
    this.currentTarget = target

    await this.deriveInterpretations(that, target, that.visCanvas.currentVisualizationState, true)

    /*
        for (var i = this.currentConstraintText.length - 1; i >= 0; i--) {
          for (var j = 0; j < this.constraintText.length; j++) {
            if (this.currentConstraintText[i]["Text"] == this.constraintText[j]) {
              this.currentConstraintText.splice(i, 1)
              this.currentConstraints.splice(i, 1)
              break
            }
          }
        }
        */

    this.currentChecks = []
    for (var i = 0; i < this.currentConstraintText.length; i++) {
      if (this.constraintText.includes(this.currentConstraintText[i]["Text"])) {
        this.currentChecks.push(true)
      }
      else {
        this.currentChecks.push(false)
      }
    }
  }


  deriveInterpretations(that, target, configuration, mode) {
    var splitTarget = target.split("_")


    if (splitTarget.length > 0) {
      if (splitTarget[0] == "Canvas") {
        if (splitTarget[1] == "x-Axis") {
          splitTarget = ["x-Axis", that.visCanvas.currentVisualizationState["x-Axis"][0]]
        }
        else if (splitTarget[1] == "Axis-0") {
          splitTarget = ["Values", that.visCanvas.currentVisualizationState["Values"][0], "Highlight"]
        }
        else if (splitTarget[1] == "Axis-1") {
          splitTarget = ["Values", that.visCanvas.currentVisualizationState["Values"][1], "Highlight"]
        }
      }
      if (splitTarget[0] == "Datafields") {

        if (splitTarget.length == 1 && mode) {
          var targets = this.suggestions.filter(element => element.startsWith("Datafields"))
          if (targets.length > 0) {
            splitTarget = targets[0].split("_")
          }
          else if (that.training.initialEntities["DATAFIELD"].length > 0) {
            splitTarget.push(that.training.initialEntities["DATAFIELD"][0]["ID"])
          }

          if (splitTarget.length > 1 && that.pinnedSuggestion) {
            that.putTargetElement(splitTarget.join("_"))
          }
        }

        if (splitTarget.length > 1) {
          this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** is a **" + that.visCanvas.dataFieldsConfigTranslate[that.visCanvas.dataFieldsConfig[splitTarget[1]]] + "** data field.", "Type": "Type", "Target": splitTarget[1] })
          this.currentConstraints.push([{ head: splitTarget[1], property: "isType", tail: that.visCanvas.dataFieldsConfig[splitTarget[1]] }])

          that.visCanvas.datafieldTypes.filter(element => element != that.visCanvas.dataFieldsConfig[splitTarget[1]]).forEach(element => {
            this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** is **not** a **" + that.visCanvas.dataFieldsConfigTranslate[element] + "** data field.", "Type": "Type", "Target": splitTarget[1] })
            this.currentConstraints.push([{ head: splitTarget[1], property: "NOT_isType", tail: element }])
          })
          if (configuration["Datafields"].includes(splitTarget[1])) {
            this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** was selected.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: "Datafields", property: "contains", tail: splitTarget[1] }])
          }
          else {
            this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** was **not** selected.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: "Datafields", property: "NOT_contains", tail: splitTarget[1] }])
          }
        }
      }
      else if (splitTarget[0] == "VISUALIZATION") {

        if (splitTarget.length == 1 && mode) {
          var targets = this.suggestions.filter(element => element.startsWith("VISUALIZATION"))
          if (targets.length > 0) {
            splitTarget = targets[0].split("_")
          }
          else if (that.training.initialEntities["VISUALIZATION"].length > 0) {
            splitTarget.push(that.training.initialEntities["VISUALIZATION"][0]["ID"])
          }

          if (splitTarget.length > 1 && that.pinnedSuggestion) {
            that.putTargetElement(splitTarget.join("_"))
          }
        }

        if (splitTarget.length > 1) {
          if (configuration['VISUALIZATION'] != splitTarget[1]) {
            this.currentConstraintText.push({ "Text": "The **" + splitTarget[1] + " chart** was **not** selected as the Visualization.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: "VISUALIZATION", property: "NOT_equals", tail: splitTarget[1] }])

            if (!mode) {
              this.currentConstraintText.push({ "Text": "The **" + configuration['VISUALIZATION'] + " chart** was selected as the Visualization.", "Type": "Status", "Target": splitTarget[0] })
              this.currentConstraints.push([{ head: "VISUALIZATION", property: "equals", tail: configuration['VISUALIZATION'] }])
            }
          }
          else {
            this.currentConstraintText.push({ "Text": "The **" + configuration['VISUALIZATION'] + " chart** was selected as the Visualization.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: "VISUALIZATION", property: "equals", tail: configuration['VISUALIZATION'] }])
          }

        }
        else {
          this.currentConstraintText.push({ "Text": "The **" + configuration['VISUALIZATION'] + " chart** was selected as the Visualization.", "Type": "Status", "Target": splitTarget[0] })
          this.currentConstraints.push([{ head: "VISUALIZATION", property: "equals", tail: configuration['VISUALIZATION'] }])

          for (var i = 0; i < that.visualizationTypes.length; i++) {
            if (that.visualizationTypes[i] != configuration['VISUALIZATION']) {
              this.currentConstraintText.push({ "Text": "The **" + configuration['VISUALIZATION'] + " chart** was **not** selected as the Visualization.", "Type": "Status", "Target": splitTarget[0] })
              this.currentConstraints.push([{ head: "VISUALIZATION", property: "NOT_equals", tail: that.visualizationTypes[i] }])
            }
          }
        }

      }
      else if (splitTarget[0] == "x-Axis" || splitTarget[0] == "Color" || splitTarget[0] == "Values") {
        var genericTarget = configuration[splitTarget[0]]
        var constraintFirst = false

        if (splitTarget.length == 1 && mode) {
          var targets = this.suggestions.filter(element => element.startsWith(splitTarget[0]))
          if (targets.length > 0) {
            splitTarget = targets[0].split("_")
          }
          else if (that.training.initialEntities["DATAFIELD"].length > 0) {
            splitTarget.push(that.training.initialEntities["DATAFIELD"][0]["ID"])
          }

          if (splitTarget.length > 1 && that.pinnedSuggestion) {
            that.putTargetElement(splitTarget.join("_"))
          }
        }

        if (splitTarget.length > 1) {

          /**Part Specific for Values */
          if (splitTarget.length > 2) {
            if (splitTarget[2] == 'Aggregate') {
              this.currentConstraintText.push({ "Text": "**" + configuration["Aggregate"][splitTarget[1]] + "** was selected as the Aggregate of **" + splitTarget[1] + "**.", "Type": "Aggregate", "Target": splitTarget[1] })
              this.currentConstraints.push([{ head: "Aggregate$" + splitTarget[1], property: "equals", tail: configuration["Aggregate"][splitTarget[1]] }])

              var aggregateEntities = [...new Set(that.training.initialEntities["AGGREGATE"].map(entry => { return entry["ID"] }))]
              if (aggregateEntities.some(agg => agg != configuration["Aggregate"][splitTarget[1]])) {
                aggregateEntities.filter(agg => agg != configuration["Aggregate"][splitTarget[1]]).forEach(agg => {
                  this.currentConstraintText.push({ "Text": "**" + agg + "** was **not** selected as the Aggregate of **" + splitTarget[1] + "**.", "Type": "Aggregate", "Target": splitTarget[1] })
                  this.currentConstraints.push([{ head: "Aggregate$" + splitTarget[1], property: "NOT_equals", tail: agg }])
                }
                )
              }
            }
            else if (splitTarget[2] == 'Highlight') {
              if (configuration["Highlight"] == splitTarget[1]) {
                this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** was highlighted in the visualization.", "Type": "Highlight", "Target": splitTarget[1] })
                this.currentConstraints.push([{ head: "Highlight", property: "equals", tail: splitTarget[1] }])
              }
              else if (configuration["Highlight"] != splitTarget[1]) {
                this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** was **not** highlighted in the visualization.", "Type": "Highlight", "Target": splitTarget[1] })
                this.currentConstraints.push([{ head: "Highlight", property: "NOT_equals", tail: splitTarget[1] }])

                if (configuration["Highlight"] == '') {
                  this.currentConstraintText.push({ "Text": "Values were **not** highlighted in the visualization.", "Type": "Highlight", "Target": splitTarget[1] })
                  this.currentConstraints.push([{ head: "Highlight", property: "equals", tail: '' }])
                }
              }

            }
          }

          if (splitTarget[1] != "Constraint") {
            if (configuration[splitTarget[0]].includes(splitTarget[1])) {
              genericTarget = [splitTarget[1]]
            }
            else {
              this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** was **not** in **" + splitTarget[0] + "**.", "Type": "Status", "Target": splitTarget[0] })
              this.currentConstraints.push([{ head: splitTarget[0], property: "NOT_contains", tail: splitTarget[1] }])
            }

          }
          else {
            constraintFirst = true
          }
        }
        if (configuration[splitTarget[0]].length == 0) {
          this.currentConstraintText.push({ "Text": "The **" + splitTarget[0] + "** was **empty**.", "Type": "Status", "Target": splitTarget[0] })
          this.currentConstraints.push([{ head: splitTarget[0], property: "isRange", tail: [0, 0] }])

          if (splitTarget[0] != "Values") {
            that.visCanvas.datafieldTypes.filter(element => element != that.visCanvas.dataFieldsConfig[configuration[splitTarget[0]][0]]).forEach(element => {
              this.currentConstraintText.push({ "Text": "**No " + that.visCanvas.dataFieldsConfigTranslate[element] + "** data field was in the **" + splitTarget[0] + "**.", "Type": "Type", "Target": genericTarget[i] })
              this.currentConstraints.push([{ head: splitTarget[0], property: "NOT_isType", tail: element }])
            })
          }
        }
        else {
          if (genericTarget.length == 1 && constraintFirst) {
            this.currentConstraintText.push({ "Text": "There was **one** data field in **" + splitTarget[0] + "**.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: splitTarget[0], property: "isRange", tail: [1, 1] }])
          }
          else if (genericTarget.length == 2 && constraintFirst) {
            this.currentConstraintText.push({ "Text": "There were **two** data fields in **" + splitTarget[0] + "**.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: splitTarget[0], property: "isRange", tail: [2, 2] }])
          }

          for (var i = 0; i < genericTarget.length; i++) {
            this.currentConstraintText.push({ "Text": "**" + genericTarget[i] + "** was in **" + splitTarget[0] + "**.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: splitTarget[0], property: "contains", tail: genericTarget[i] }])

            if (splitTarget[0] != "Values") {
              this.currentConstraintText.push({ "Text": "A **" + that.visCanvas.dataFieldsConfigTranslate[that.visCanvas.dataFieldsConfig[genericTarget[i]]] + "** data field was already specified as the **" + splitTarget[0] + "**.", "Type": "Type", "Target": genericTarget[i] })
              this.currentConstraints.push([{ head: splitTarget[0], property: "isType", tail: that.visCanvas.dataFieldsConfig[configuration[splitTarget[0]][0]] }])


            }
          }
          if (genericTarget.length == 1 && !constraintFirst) {
            this.currentConstraintText.push({ "Text": "There was **one** datafield in **" + splitTarget[0] + "**.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: splitTarget[0], property: "isRange", tail: [1, 1] }])
          }
          else if (genericTarget.length == 2 && !constraintFirst) {
            this.currentConstraintText.push({ "Text": "There were **two** datafields in **" + splitTarget[0] + "**.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: splitTarget[0], property: "isRange", tail: [2, 2] }])
          }


        }



      }
      else if (splitTarget[0] == "Filter") {
        if (configuration[splitTarget[0]].length == 0) {
          var targets = this.suggestions.filter(element => element.startsWith("Datafields"))
          this.currentConstraintText.push({ "Text": "The **" + splitTarget[0] + " Panel** was empty.", "Type": "Status", "Target": splitTarget[0] })
          this.currentConstraints.push([{ head: splitTarget[0], property: "isRange", tail: [0, 0] }])
        }

        if (splitTarget.length > 1 && splitTarget[1] != "Adding") {
          if (configuration[splitTarget[0]].includes(splitTarget[1])) {
            this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** was in the **" + splitTarget[0] + " Panel**.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: splitTarget[0], property: "contains", tail: splitTarget[1] }])
          }
          else {
            this.currentConstraintText.push({ "Text": "**" + splitTarget[1] + "** was **not** in the **" + splitTarget[0] + " Panel**.", "Type": "Status", "Target": splitTarget[0] })
            this.currentConstraints.push([{ head: splitTarget[0], property: "NOT_contains", tail: splitTarget[1] }])
          }
          if (splitTarget.length > 3) {
            if (configuration["FilterC"][splitTarget[1]].includes(splitTarget[3])) {
              this.currentConstraintText.push({ "Text": "**" + splitTarget[3] + "** was selected.", "Type": "StatusSub", "Target": splitTarget[1] })
              this.currentConstraints.push([{ head: splitTarget[1] + "$FilterC", property: "contains", tail: splitTarget[3] }])
            }
            else {
              this.currentConstraintText.push({ "Text": "**" + splitTarget[3] + "** was **not** selected.", "Type": "StatusSub", "Target": splitTarget[1] })
              this.currentConstraints.push([{ head: splitTarget[1] + "$FilterC", property: "NOT_contains", tail: splitTarget[3] }])
            }

          }
          if (that.visCanvas.optionDictionary[splitTarget[1]].every(element => configuration["FilterC"][splitTarget[1]].includes(element['label']))) {
            this.currentConstraintText.push({ "Text": "All **" + splitTarget[1] + "** were selected.", "Type": "StatusSub", "Target": splitTarget[1] })
            this.currentConstraints.push([{ head: splitTarget[1] + "$FilterC", property: "equals", tail: "ALL" }])
          }
          else {
            this.currentConstraintText.push({ "Text": "**Not** all **" + splitTarget[1] + "** were selected.", "Type": "StatusSub", "Target": splitTarget[1] })
            this.currentConstraints.push([{ head: splitTarget[1] + "$FilterC", property: "NOT_equals", tail: "ALL" }])
          }
        }
        if (configuration[splitTarget[0]].length != 0) {
          var targets = this.suggestions.filter(element => element.startsWith("Datafields"))
          this.currentConstraintText.push({ "Text": "The **" + splitTarget[0] + " Panel** was **not** empty.", "Type": "Status", "Target": splitTarget[0] })
          this.currentConstraints.push([{ head: splitTarget[0], property: "NOT_isRange", tail: [0, 0] }])
        }

      }

    }
  }


  addConstraint(that, targetText, event, selected) {
    console.log(event)

    document.getElementById("constraintsHighlight")["style"]["box-shadow"] = "0px 0px 10px 2px #9333ea"

    var index = -1
    for (var i = 0; i < this.currentConstraintText.length; i++) {
      if (this.currentConstraintText[i]["Text"] == targetText["Text"]) {
        index = i
        break
      }
    }

    if (this.currentChecks.length > index && !this.currentChecks[index]) {

      this.constraintText.unshift(this.currentConstraintText[index]["Text"])
      this.constraints.unshift(this.currentConstraints[index])
      this.currentChecks[index] = true
    }
    else if (this.currentChecks.length > index && this.currentChecks[index]) {

      var targetIndex = this.constraintText.indexOf(targetText["Text"])
      this.constraintText.splice(targetIndex, 1)
      this.constraints.splice(targetIndex, 1)
      this.currentChecks[index] = false
    }

    this.getAmbiguousNumber(that)
    setTimeout(element => { $('#constraintsHighlight').css("box-shadow", ""); }, 1500)

  }

  getIndex(that, text) {
    var index = -1
    for (var i = 0; i < this.currentConstraintText.length; i++) {
      if (this.currentConstraintText[i]["Text"] == text) {
        index = i
      }
    }
    if (this.currentChecks.length > index && this.currentChecks[index]) {
      return true
    }
    return false
  }

  removeConstraint(that, constraintText) {
    var targetIndex = this.constraintText.indexOf(constraintText)
    this.constraintText.splice(targetIndex, 1)
    this.constraints.splice(targetIndex, 1)

    this.getAmbiguousNumber(that)

    if (that.displaySuggestionDialog) {
      this.currentChecks = []
      for (var i = 0; i < this.currentConstraintText.length; i++) {
        if (this.constraintText.includes(this.currentConstraintText[i]["Text"])) {
          this.currentChecks.push(true)
        }
        else {
          this.currentChecks.push(false)
        }
      }
    }
    else if (that.displayAmbiguityDialogStart) {
      this.currentChecks = []
      for (var i = 0; i < this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].length; i++) {
        if (this.constraintText.includes(this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"][i]["Text"])) {
          this.currentChecks.push(true)
        }
        else {
          this.currentChecks.push(false)
        }
      }
    }
  }

  useAccordion(type) {
    return this.currentConstraintText.filter(element => element['Type'] == type).length;
  }

  getElementsOfType(type) {
    return this.currentConstraintText.filter(element => element['Type'] == type);
  }

  getTitle(type) {
    var elements = this.currentConstraintText.filter(element => element['Type'] == type)
    if (elements.length > 0) {
      if (type == "Status") {
        return "... the Status of " + elements[0]["Target"]
      }
      else if (type == "Type") {
        if (typeof (elements[0]["Target"]) == 'undefined') {
          return "... the Data Field Type of " + this.currentConstraintText.filter(element => element['Type'] == "Status")[0]["Target"]
        }
        else {
          return "... the Data Field Type of " + elements[0]["Target"]
        }

      }
      else if (type == "StatusSub") {
        return "... the Status of Subcategories of " + elements[0]["Target"]
      }
      else if (type == "Aggregate") {
        return "... the Aggregate Value of " + elements[0]["Target"]
      }
      else if (type == "Highlight") {
        return "... the Highlighted Values"
      }
    }
    return ""
  }

  numberOfUniqueTypes() {
    var types = new Set(this.currentConstraintText.map(element => element["Type"]))
    return types.size
  }


  showAmbiguity(that, mode) {
    if (mode == "next") {
      this.ambiguityPrevious = true
      this.ambiguityIndex += 1
      if (this.ambiguityIndex >= this.ambiguitiesEnd.length - 1) {
        this.ambiguityNext = false
      }
    }
    else if (mode == "previous") {
      this.ambiguityNext = true
      this.ambiguityIndex -= 1
      if (this.ambiguityIndex <= 0) {
        this.ambiguityPrevious = false
      }
    }
    this.showAmbiguousNLG(that)
  }

  showAmbiguityStart(that, mode) {
    if (mode == "next") {
      this.ambiguityStartPrevious = true
      this.ambiguityStartIndex += 1
      if (this.ambiguityStartIndex >= this.ambiguousConditions.length - 1) {
        this.ambiguityStartNext = false
      }
    }
    else if (mode == "previous") {
      this.ambiguityStartNext = true
      this.ambiguityStartIndex -= 1
      if (this.ambiguityStartIndex <= 0) {
        this.ambiguityStartPrevious = false
      }
    }
    that.putTargetElement(this.ambiguousConditions[this.ambiguityStartIndex]["Target"])

    this.currentChecks = []
    for (var i = 0; i < this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].length; i++) {
      if (this.constraintText.includes(this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"][i]["Text"])) {
        this.currentChecks.push(true)
      }
      else {
        this.currentChecks.push(false)
      }
    }

    if (that.line == null) {
      that.showConnection()
    }
    else {
      that.line.position()
    }
  }

  useAccordionStart(type) {
    return this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].filter(element => element['Type'] == type).length;
  }

  getElementsOfTypeStart(type) {
    return this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].filter(element => element['Type'] == type);
  }

  getTitleStart(type) {
    var elements = this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].filter(element => element['Type'] == type)
    if (elements.length > 0) {
      if (type == "Status") {
        return "... the Status of " + elements[0]["Target"]
      }
      else if (type == "Type") {
        if (typeof (elements[0]["Target"]) == 'undefined') {
          return "... the Data Field Type of " + this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].filter(element => element['Type'] == "Status")[0]["Target"]
        }
        else {
          return "... the Data Field Type of " + elements[0]["Target"]
        }
      }
      else if (type == "StatusSub") {
        return "... the Status of Subcategories of " + elements[0]["Target"]
      }
      else if (type == "Aggregate") {
        return "... the Aggregate Value of " + elements[0]["Target"]
      }
      else if (type == "Status") {
        return "... the Highlighted Values"
      }
    }
    return ""
  }

  addConstraintStart(that, targetText, event) {

    var index = -1
    for (var i = 0; i < this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].length; i++) {
      if (this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"][i]["Text"] == targetText["Text"]) {
        index = i
      }
    }

    console.log(event)
    document.getElementById("constraintsHighlight")["style"]["box-shadow"] = "0px 0px 10px 2px #9333ea"

    if (this.currentChecks.length > index && !this.currentChecks[index]) {

      this.constraintText.unshift(this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"][index]["Text"])
      this.constraints.unshift(this.ambiguousConditions[this.ambiguityStartIndex]["Condition"][index])
      this.currentChecks[index] = true

    }
    else if (this.currentChecks.length > index && this.currentChecks[index]) {
      var targetIndex = this.constraintText.indexOf(targetText["Text"])
      this.constraintText.splice(targetIndex, 1)
      this.constraints.splice(targetIndex, 1)

      this.currentChecks[index] = false

      this.getAmbiguousNumber(that)
    }



    /**

    for (var j = 0; j < this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].length; j++) {
      if (this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"][j]["Text"] == this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"][index]["Text"]) {
        this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].splice(j, 1)
        this.ambiguousConditions[this.ambiguityStartIndex]["Condition"].splice(j, 1)
      }
    }
    */

    this.getAmbiguousNumber(that)
    setTimeout(element => { $('#constraintsHighlight').css("box-shadow", ""); }, 1500)

  }

  getIndexStart(that, text) {
    var index = -1
    for (var i = 0; i < this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"].length; i++) {
      if (this.ambiguousConditions[this.ambiguityStartIndex]["ConditionText"][i]["Text"] == text) {
        index = i
      }
    }
    if (this.currentChecks.length > index && this.currentChecks[index]) {
      return true
    }
    return false
  }



}







