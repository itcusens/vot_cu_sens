import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotelistComponent } from './votelist.component';

describe('VotelistComponent', () => {
  let component: VotelistComponent;
  let fixture: ComponentFixture<VotelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
