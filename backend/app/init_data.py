"""
Initial data setup for the application
"""

import uuid
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.team import Team
from app.models.worker import Worker
from app.security import get_password_hash


def init_default_data(db: Session):
    """Initialize default users and teams"""

    # Check if data already exists
    if db.query(User).first():
        return

    # Create teams
    team1 = Team(id=str(uuid.uuid4()), name="팀1", manager_id="2")
    team2 = Team(id=str(uuid.uuid4()), name="팀2", manager_id="3")
    team3 = Team(id=str(uuid.uuid4()), name="팀3", manager_id="4")

    db.add_all([team1, team2, team3])
    db.flush()

    # Create users
    admin_user = User(
        id="1", email="ys26k", password=get_password_hash("ys7502!@02"), role="admin"
    )

    manager1 = User(
        id="2",
        email="team1",
        password=get_password_hash("team1"),
        role="manager",
        team_id=team1.id,
        team_name="팀1",
    )

    manager2 = User(
        id="3",
        email="team2",
        password=get_password_hash("team2"),
        role="manager",
        team_id=team2.id,
        team_name="팀2",
    )

    manager3 = User(
        id="4",
        email="team3",
        password=get_password_hash("team3"),
        role="manager",
        team_id=team3.id,
        team_name="팀3",
    )

    db.add_all([admin_user, manager1, manager2, manager3])
    db.commit()
