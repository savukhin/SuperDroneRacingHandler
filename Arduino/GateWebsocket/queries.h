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

  float getSpeed() {
    return (float)this->count / (this->duration / 1000.);
  }
};

BlinkQuery isBlink(String data) {
  std::vector<String> queries = parseQuery(data);
  
  if (queries.size() != 4)
    return BlinkQuery {false, 0, 0};

  if (queries[0] != String("blink") 
        || !isInt(queries[1])
        || !isInt(queries[2])
        || !isColor(queries[3])) {
          
    return BlinkQuery {false, 0, 0};
  }
  
  BlinkQuery result;
  result.valid = true;
  result.count = toInt(queries[1]);
  result.duration = toInt(queries[2]);
  result.color = Color::fromString(queries[3]);
  return result;
}

#endif
