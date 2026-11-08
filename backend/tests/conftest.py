from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.core.config import settings
from app.core.db import engine, init_db
from app.main import app
from app.models import Item, User
from tests.utils.user import login_user_by_email
from tests.utils.utils import login_superuser


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session]:
    with Session(engine) as session:
        init_db(session)
        yield session
        statement = delete(Item)
        session.execute(statement)
        statement = delete(User)
        session.execute(statement)
        session.commit()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_client(db: Session) -> Generator[TestClient]:
    """A client logged in as the first superuser (cookie based auth)."""
    with TestClient(app) as c:
        login_superuser(c)
        yield c


@pytest.fixture(scope="module")
def normal_user_client(db: Session) -> Generator[TestClient]:
    """A client logged in as a normal (non-superuser) user."""
    with TestClient(app) as c:
        login_user_by_email(client=c, email=settings.EMAIL_TEST_USER, db=db)
        yield c
