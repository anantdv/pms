app_name = "pms"
app_title = "Property Management System"
app_publisher = "Administrator"
app_description = "Property Management System"
app_email = "admin@example.com"
app_license = "mit"

# Website Routes
# --------------
website_route_rules = [
    {"from_route": "/pms/<path:app_path>", "to_route": "pms"},
    {"from_route": "/pms", "to_route": "pms"},
]
