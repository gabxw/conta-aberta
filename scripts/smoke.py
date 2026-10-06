"""Run against a disposable seeded database. Mutates demo recommendations."""
import json, sys, urllib.request, urllib.error

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5090/api/v1'

def request(path, body=None, expected=200):
    raw = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(base + path, data=raw, headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=15) as response:
            status, data = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, data = error.code, error.read()
    assert status == expected, (path,status,data.decode())
    return json.loads(data) if data else None

dashboard = request('/dashboard')
assert dashboard['isDemo'] is True
m = dashboard['mileage']
assert m['projectedKm'] == 1830 and m['allowanceKm'] == 1500 and m['excessKm'] == 330
assert m['estimatedExcessCost'] == 247.5
assert dashboard['serviceValue']['total'] == sum(i['referenceValue'] for i in dashboard['serviceValue']['items'])
assert len(request('/usage?months=6')['months']) == 6
assert request('/timeline?type=all')['events']
request('/actions',{'type':'does-not-exist'},400)
request('/actions',{'type':'schedule-maintenance','targetId':'maintenance-review','scheduledDate':'2026-01-01'},400)
request('/events',{'name':'not-allowed','page':'/'},400)
before = request('/admin/overview')
request('/events',{'name':'page_view','page':'/smoke'},204)
after = request('/admin/overview')
assert after['totalEvents'] == before['totalEvents'] + 1
recommendation = dashboard['nextBestAction']
assert recommendation['type'] == 'schedule-maintenance'
scheduled = request('/actions', {'type':'schedule-maintenance','targetId':recommendation['id'],'scheduledDate':'2026-10-22'})
assert scheduled['eventId']
recommendation = request('/dashboard')['nextBestAction']
assert recommendation['type'] == 'mileage-plan'
action = {'type':'mileage-plan','targetId':recommendation['id']}
first = request('/actions',action)
second = request('/actions',action)
assert first['eventId'] == second['eventId'], 'repeated action created another event'
new_dashboard = request('/dashboard')
assert new_dashboard['nextBestAction']['id'] != recommendation['id']
assert new_dashboard['nextBestAction']['type'] == 'review-document'
assert request('/admin/overview')['actionsCompleted'] == before['actionsCompleted'] + 2
print('PASS: projection, value, history, timeline, validation, tracking, action persistence and idempotence')
