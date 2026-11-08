from fastapi.testclient import TestClient
from sqlmodel import Session

from app import crud
from app.models import User, UserCreate, UserUpdate
from tests.utils.utils import login, random_email, random_lower_string


def create_random_user(db: Session) -> User:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    return user


def login_user_by_email(
    *, client: TestClient, email: str, db: Session
) -> None:
    """
    Log the user with the given email in on the client (cookie based).

    If the user doesn't exist it is created first.
    """
    password = random_lower_string()
    user = crud.get_user_by_email(session=db, email=email)
    if not user:
        user_in_create = UserCreate(email=email, password=password)
        crud.create_user(session=db, user_create=user_in_create)
    else:
        user_in_update = UserUpdate(password=password)
        if not user.id:
            raise Exception("User id not set")
        crud.update_user(session=db, db_user=user, user_in=user_in_update)

    login(client, email=email, password=password)
