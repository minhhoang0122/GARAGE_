package com.gara.dto;

public record SearchResultDTO(
                boolean found,
                String type,
                Integer id,
                String plate,
                String message) {

        public static SearchResultDTOBuilder builder() {
                return new SearchResultDTOBuilder();
        }

        public static class SearchResultDTOBuilder {
                private boolean found;
                private String type;
                private Integer id;
                private String plate;
                private String message;

                public SearchResultDTOBuilder found(boolean found) {
                        this.found = found;
                        return this;
                }

                public SearchResultDTOBuilder type(String type) {
                        this.type = type;
                        return this;
                }

                public SearchResultDTOBuilder id(Integer id) {
                        this.id = id;
                        return this;
                }

                public SearchResultDTOBuilder plate(String plate) {
                        this.plate = plate;
                        return this;
                }

                public SearchResultDTOBuilder message(String message) {
                        this.message = message;
                        return this;
                }

                public SearchResultDTO build() {
                        return new SearchResultDTO(found, type, id, plate, message);
                }
        }
}
