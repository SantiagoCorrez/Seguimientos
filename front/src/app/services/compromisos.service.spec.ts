import { TestBed } from '@angular/core/testing';

import { CompromisosService } from './compromisos.service';

describe('CompromisosService', () => {
  let service: CompromisosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompromisosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
