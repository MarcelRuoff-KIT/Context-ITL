import { TestBed } from '@angular/core/testing';

import { InfoVisInteractionService } from './info-vis-interaction.service';

describe('InfoVisInteractionService', () => {
  let service: InfoVisInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoVisInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
