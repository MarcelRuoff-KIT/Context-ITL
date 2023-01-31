import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptVisComponent } from './script-vis.component';

describe('ScriptVisComponent', () => {
  let component: ScriptVisComponent;
  let fixture: ComponentFixture<ScriptVisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptVisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScriptVisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
