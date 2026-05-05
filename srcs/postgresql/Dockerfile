FROM postgres:18-alpine

COPY ./setup/entrypoint.sh .

CMD chmod 755 ./entrypoint.sh

ENTRYPOINT [ "entrypoint.sh" ]
