import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MCatalogDetailComponent } from './m-catalog-detail.component';

describe('MCatalogDetailComponent', () => {
  let component: MCatalogDetailComponent;
  let fixture: ComponentFixture<MCatalogDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCatalogDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MCatalogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
