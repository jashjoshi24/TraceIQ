import asyncio
import sys
import os

# Ensure the backend directory is in sys.path for running directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import SessionLocal
from app.models.rbac import Role, Permission
from app.models.user import User
from app.models.profile import UserProfile
from app.core.security import get_password_hash

async def seed():
    print("Connecting to database and running seed...")
    async with SessionLocal() as db:
        print("Seeding permissions...")
        permissions_data = {
            "view_dashboard": "Can view the main dashboard dashboard metrics.",
            "upload_pcap": "Can upload and analyze PCAP files.",
            "view_cases": "Can view incident response cases.",
            "manage_users": "Can manage users, profiles, and role assignments.",
            "view_reports": "Can generate and view compliance and system reports."
        }
        
        db_perms = {}
        for name, desc in permissions_data.items():
            result = await db.execute(select(Permission).where(Permission.name == name))
            perm = result.scalars().first()
            if not perm:
                perm = Permission(name=name, description=desc)
                db.add(perm)
                print(f"Created permission: {name}")
            else:
                perm.description = desc
            db_perms[name] = perm
            
        await db.flush()
        
        print("Seeding roles...")
        roles_data = {
            "Admin": list(permissions_data.keys()),
            "SOC Analyst": ["view_dashboard", "upload_pcap", "view_cases"],
            "Investigator": ["view_dashboard", "view_cases"],
            "Manager": ["view_dashboard", "view_cases", "view_reports"]
        }
        
        db_roles = {}
        for role_name, perm_names in roles_data.items():
            result = await db.execute(
                select(Role)
                .where(Role.name == role_name)
                .options(selectinload(Role.permissions))
            )
            role = result.scalars().first()
            role_perms = [db_perms[pn] for pn in perm_names]
            
            if not role:
                role = Role(
                    name=role_name,
                    description=f"{role_name} system role",
                    permissions=role_perms
                )
                db.add(role)
                print(f"Created role: {role_name}")
            else:
                role.permissions = role_perms
                print(f"Updated permissions for role: {role_name}")
            db_roles[role_name] = role
            
        await db.flush()
        
        print("Seeding default demo users...")
        users_to_seed = [
            {
                "username": "admin",
                "email": "admin@traceiq.local",
                "password": "adminpassword",
                "role": "Admin",
                "first_name": "Super",
                "last_name": "Admin",
                "department": "Global Security Operations"
            },
            {
                "username": "analyst",
                "email": "analyst@traceiq.local",
                "password": "analystpassword",
                "role": "SOC Analyst",
                "first_name": "Alex",
                "last_name": "Analyst",
                "department": "Threat Monitoring Center"
            },
            {
                "username": "investigator",
                "email": "investigator@traceiq.local",
                "password": "investigatorpassword",
                "role": "Investigator",
                "first_name": "Iris",
                "last_name": "Investigator",
                "department": "Digital Forensics & Incident Response"
            },
            {
                "username": "manager",
                "email": "manager@traceiq.local",
                "password": "managerpassword",
                "role": "Manager",
                "first_name": "Morgan",
                "last_name": "Manager",
                "department": "Cyber Governance & Risk"
            },
        ]

        for udata in users_to_seed:
            result = await db.execute(
                select(User)
                .where(User.username == udata["username"])
                .options(selectinload(User.roles), selectinload(User.profile))
            )
            existing_user = result.scalars().first()

            if not existing_user:
                new_user = User(
                    username=udata["username"],
                    email=udata["email"],
                    password_hash=get_password_hash(udata["password"]),
                    is_active=True,
                    is_verified=True,
                    roles=[db_roles[udata["role"]]]
                )
                db.add(new_user)
                await db.flush()

                profile = UserProfile(
                    user_id=new_user.id,
                    first_name=udata["first_name"],
                    last_name=udata["last_name"],
                    avatar="",
                    phone="+1-555-0100",
                    department=udata["department"]
                )
                db.add(profile)
                print(f"Created {udata['role']} user: {udata['username']} (password: {udata['password']})")
            else:
                # Ensure user has assigned role
                if db_roles[udata["role"]] not in existing_user.roles:
                    existing_user.roles.append(db_roles[udata["role"]])
                    print(f"Assigned {udata['role']} role to existing user {udata['username']}.")

        await db.commit()
        print("Seeding operations completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
