# KB: Build the Compliance Tracker dashboard in Power BI

Purpose: recreate the NDMO / NDI Compliance Tracker dashboard in Microsoft Power BI from the data exported by the app.

## 1. What you need

1. Power BI Desktop (free) – install from the Microsoft Store or powerbi.microsoft.com.
2. The data file from this app: Dashboard → Power BI → Download data (CSV).
3. Optional: the matching colour theme – Dashboard → Power BI → Download Power BI theme.

## 2. Export the data

1. Open the tracker → Dashboard → Power BI.
2. Click “Download data (CSV)” and save compliance-tracker-powerbi.csv in a folder you will keep (a OneDrive or SharePoint folder is best).
3. Click “Download Power BI theme” and save the .json file.
4. The file contains one row per tracked item (all NDMO specifications, NDI evidence items and criteria, and OE metrics) with the columns listed in the data dictionary below.

## 3. Load the data

1. Power BI Desktop → Home → Get data → Text/CSV → choose the file → Transform Data.
2. In Power Query set the data types: Submitted Date and Due Date = Date; every other column = Text.
3. Rename the query to Tracker (the measures below use this name), then Close & Apply.

## 4. Create the calendar table and the Live Status column

1. Modeling → New table, paste: Calendar = CALENDARAUTO()
2. Model view: drag Tracker[Submitted Date] onto Calendar[Date] (many-to-one, active). Add Tracker[Due Date] → Calendar[Date] as a second relationship and leave it inactive.
3. Modeling → New column on Tracker, paste the formula below. Use Live Status instead of Status in every visual so overdue items update every day.

```dax
Live Status = IF(Tracker[Status] = "Completed", "Completed", IF(NOT ISBLANK(Tracker[Due Date]) && Tracker[Due Date] < TODAY(), "Overdue", "Pending"))
```

## 5. Add the measures

1. Modeling → New measure, once per line below.

```dax
Total Items = COUNTROWS(Tracker)
Completed = CALCULATE([Total Items], Tracker[Live Status] = "Completed")
Pending = CALCULATE([Total Items], Tracker[Live Status] = "Pending")
Overdue = CALCULATE([Total Items], Tracker[Live Status] = "Overdue")
Completion % = DIVIDE([Completed], [Total Items])
Due in 14 Days = CALCULATE([Total Items], Tracker[Live Status] <> "Completed", Tracker[Due Date] >= TODAY(), Tracker[Due Date] <= TODAY() + 14)
Cumulative Completed = CALCULATE([Completed], FILTER(ALL(Calendar[Date]), Calendar[Date] <= MAX(Calendar[Date])))
```

## 6. Build the visuals (same as the app dashboard)

| Visual | Power BI type | Fields / settings |
|---|---|---|
| KPI cards (6) | Card | Total Items, Completed, Pending, Overdue, Due in 14 Days, Completion % |
| Status split | Donut chart | Legend: Live Status · Values: Total Items |
| Progress by domain | Stacked bar chart | Y-axis: Domain · X-axis: Total Items · Legend: Live Status |
| By priority / level / platform | Stacked column chart | X-axis: Priority / Level · Y-axis: Total Items · Legend: Live Status |
| Completions over time | Area chart | X-axis: Calendar[Date] (Month) · Y-axis: Cumulative Completed, Completed |
| Items due by month | Stacked column chart | X-axis: Due Month · Y-axis: Total Items · Legend: Live Status · Visual filter: Live Status is not Completed |
| Overdue and due in 14 days | Table | Due Date, Live Status, Item, Owner · Filter: Live Status is not Completed and Due Date ≤ today + 14 |
| Metrics table | Table | Type, Domain Name, Item, Group, Priority / Level, Live Status, Submitted Date, Due Date, Owner, Evidence Ref |

## 7. Add filters (slicers)

1. Add Slicer visuals for: Domain Name, Live Status, Priority / Level, Owner, and Due Date (Between).
2. Create 4 pages – Overview, NDMO, NDI, NDI OE – and set a page-level filter Type = NDMO / NDI / OE on the last three (Overview has no filter). Add a fifth page “Metrics table”.
3. Turn on Edit interactions so clicking a bar or slice cross-filters the other visuals, as it does in the app.

## 8. Apply the theme

1. View → Themes → Browse for themes → choose the downloaded .json.
2. Status colours used in the app: Completed = your theme colour, Pending = #94A3B8, Overdue = #DC2626.

## 9. Publish and refresh

1. Home → Publish → choose a workspace; share the report from Power BI Service.
2. The tracker keeps its data in your browser. To update Power BI, export the CSV again and overwrite the same file, then click Home → Refresh.
3. For scheduled refresh, keep the CSV in OneDrive/SharePoint and load it with Get data → SharePoint folder (or Web using the OneDrive link), then set a refresh schedule in Power BI Service.

## 10. Troubleshooting

1. Dates show as text: change the column type to Date in Power Query.
2. Numbers differ from the app: the app counts overdue from today; make sure visuals use Live Status and the CSV is recent.
3. Measures show an error: check the query is named Tracker and the table is named Calendar.

## Data dictionary (CSV columns)

- Type
- Domain
- Domain Name
- Group
- Item
- Priority / Level
- Status
- Submitted Date
- Due Date
- Owner
- Evidence Ref
- Notes
- Submitted Month
- Due Month
- Key
