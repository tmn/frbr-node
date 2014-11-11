xquery version "3.0";

declare namespace f = "http://idi.ntnu.no/frbrizer/";
declare namespace marc = "http://www.loc.gov/MARC21/slim";
declare namespace json = "http://www.json.org";

declare variable $query external;
declare variable $type external;

declare option exist:serialize "method=json media-type=application/json";

let $dataset := collection('/db/frbrsearch/data/frbrxml')/marc:record[ft:query(., $query) and @f:type = $type]

for $node in $dataset order by ft:score($node) descending
return
  <json:value json:array="true">
    <id>{data($node/@f:id)}</id>
    <score>{ft:score($node)}</score>
  </json:value>
