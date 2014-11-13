xquery version "3.0";

declare namespace f = "http://idi.ntnu.no/frbrizer/";
declare namespace marc = "http://www.loc.gov/MARC21/slim";
declare namespace json = "http://www.json.org";

declare variable $query external;

declare option exist:serialize "method=json media-type=application/json";

let $dataset := collection('/db/frbrsearch/data/frbrxml')/marc:record[ft:query(., $query)]

let $sorted_nodes :=
  for $node in $dataset
  order by ft:score($node) descending
  return $node

for $node at $count in subsequence($sorted_nodes, 1, 5)
return
  <json:value json:array="true">
    <id>{data($node/@f:id)}</id>
    <score>{ft:score($node)}</score>
    <doc>{$node}</doc>
  </json:value>
