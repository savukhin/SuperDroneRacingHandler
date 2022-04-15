#ifndef QUERIES_H
#define QUERIES_H

#include <vector>
#include "myLib.h"
#include "colors.h"

std::vector<String> parseQuery(String query) {
  std::vector<String> result;
  char *str = new char[query.length() + 1];
  strcpy(str, query.c_str());
  str[query.length()] = '\0';
  char * pch = strtok (str, "-");

  while (pch != NULL) {
    result.push_back(toString(pch));
    pch = strtok (NULL, "-");
  }

  free(str);

  return result;
}

struct BaseQuery {
  bool valid = true;
};

struct BlinkQuery : public BaseQuery {
  int count;
  float duration; // in ms
  Color color;
  bool endless = false;

  float getSpeed() {
//    return (float)this->count / (this->duration / 1000.);
    return 1 / (duration / 1000.);
  }
};

BlinkQuery isEndlessBlink(String data) {
  std::vector<String> queries = parseQuery(data);

  if (queries.size() != 5)
    return BlinkQuery {false, 0, 0};

  if (queries[0] != String("blink")
      || !isInt(queries[1])
      || !isInt(queries[2])
      || !isColor(queries[3])
      || queries[4] != String("endless")) {

    return BlinkQuery {false, 0, 0};
  }

  BlinkQuery result;
  result.valid = true;
  result.count = toInt(queries[1]);
  result.color = Color::fromString(queries[3]);  
  result.endless = true;
  result.duration = toInt(queries[2]);
  
  return result;
}

BlinkQuery isBlink(String data) {
  std::vector<String> queries = parseQuery(data);

  auto checkEndless = isEndlessBlink  (data);
  if (checkEndless.valid)
    return checkEndless;

  if (queries.size() != 4)
    return BlinkQuery {false, 0, 0};

  if (queries[0] != String("blink")
      || !isInt(queries[1])
      || (!isInt(queries[2]) && queries[2] != String("endless"))
      || !isColor(queries[3])) {

    return BlinkQuery {false, 0, 0};
  }

  BlinkQuery result;
  result.valid = true;
  result.count = toInt(queries[1]);
  result.color = Color::fromString(queries[3]);
  result.endless = false;
  result.duration = toInt(queries[2]);
  
  return result;
}

#endif
