UPDATE auth.users
SET encrypted_password = crypt('Coachrony@2026', gen_salt('bf')),
    updated_at = now()
WHERE lower(email) = 'coachronyacademy@gmail.com';