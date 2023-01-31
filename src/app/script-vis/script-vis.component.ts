import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-script-vis',
  templateUrl: './script-vis.component.html',
  styleUrls: ['./script-vis.component.scss']
})
export class ScriptVisComponent implements AfterViewInit {

  @Input() id = -1
  @Input() that: any

  constructor() { }

  ngAfterViewInit(): void {
    console.log("created", this.id)
    this.that.nlg.initializeUnderstandingDisplay(this.that, this.that.training.possibleActions[this.id]["Action"], "training", this.id)
  }

}
